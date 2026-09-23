<?php

namespace App\Http\Controllers\Api;

use App\Events\IncidentCreated;
use App\Events\SosCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\SyncRequest;
use App\Models\Incident;
use App\Models\SosRequest as SosRequestModel;
use App\Models\SyncOperation;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SyncController extends Controller
{
    use ApiResponse;

    /**
     * Idempotent sync endpoint. Each operation is wrapped in its own transaction and
     * keyed by a unique operation_id. Replaying the same operation_id returns the
     * previously stored result instead of reprocessing it. incidents.uuid / sos_requests.uuid
     * are a second safety net (server upserts by client uuid).
     */
    public function store(SyncRequest $request)
    {
        $user = $request->user();
        $deviceId = $request->input('device_id') ?? $user->device_id;
        $results = [];

        foreach ($request->validated()['operations'] as $operation) {
            $results[] = $this->applyOperation($operation, $user, $deviceId);
        }

        return $this->success(['results' => $results], 'Sync processed');
    }

    private function applyOperation(array $operation, $user, ?string $deviceId): array
    {
        $operationId = $operation['operation_id'];

        $existing = SyncOperation::where('operation_id', $operationId)->first();
        if ($existing) {
            return [
                'operation_id' => $operationId,
                'status' => $existing->status,
                'result_entity_id' => $existing->result_entity_id,
                'replayed' => true,
            ];
        }

        return DB::transaction(function () use ($operation, $operationId, $user, $deviceId) {
            $syncOp = SyncOperation::create([
                'device_id' => $deviceId,
                'operation_id' => $operationId,
                'type' => $operation['type'],
                'payload' => $operation['payload'],
                'status' => SyncOperation::STATUS_PENDING,
            ]);

            try {
                $entityId = match ($operation['type']) {
                    SyncOperation::TYPE_CREATE_INCIDENT => $this->createIncident($operation['payload'], $user, $deviceId),
                    SyncOperation::TYPE_CREATE_SOS => $this->createSos($operation['payload'], $user, $deviceId),
                    SyncOperation::TYPE_UPDATE_INCIDENT => $this->updateIncident($operation['payload']),
                    default => throw new \InvalidArgumentException('Unsupported sync operation type'),
                };

                $syncOp->update([
                    'status' => SyncOperation::STATUS_APPLIED,
                    'result_entity_id' => $entityId,
                    'processed_at' => now(),
                ]);

                return [
                    'operation_id' => $operationId,
                    'status' => SyncOperation::STATUS_APPLIED,
                    'result_entity_id' => $entityId,
                    'replayed' => false,
                ];
            } catch (\Throwable $e) {
                $syncOp->update([
                    'status' => SyncOperation::STATUS_FAILED,
                    'processed_at' => now(),
                ]);

                return [
                    'operation_id' => $operationId,
                    'status' => SyncOperation::STATUS_FAILED,
                    'error' => $e->getMessage(),
                    'replayed' => false,
                ];
            }
        });
    }

    private function createIncident(array $payload, $user, ?string $deviceId): string
    {
        $clientUuid = $payload['uuid'] ?? (string) Str::uuid();

        $incident = Incident::firstOrCreate(
            ['uuid' => $clientUuid],
            [
                'reporter_id' => $user->id,
                'device_id' => $payload['device_id'] ?? $deviceId,
                'type' => $payload['type'],
                'title' => $payload['title'],
                'description' => $payload['description'] ?? null,
                'latitude' => $payload['latitude'],
                'longitude' => $payload['longitude'],
                'location_accuracy' => $payload['location_accuracy'] ?? null,
                'severity' => $payload['severity'],
                'status' => 'REPORTED',
                'verification_status' => 'UNVERIFIED',
                'source' => $payload['source'] ?? 'USER',
                'created_offline' => true,
                'synced_at' => now(),
            ]
        );

        if ($incident->wasRecentlyCreated) {
            IncidentCreated::dispatch($incident, $user);
        }

        return $incident->id;
    }

    private function createSos(array $payload, $user, ?string $deviceId): string
    {
        $clientUuid = $payload['uuid'] ?? (string) Str::uuid();

        $sos = SosRequestModel::firstOrCreate(
            ['uuid' => $clientUuid],
            [
                'user_id' => $user->id,
                'device_id' => $payload['device_id'] ?? $deviceId,
                'latitude' => $payload['latitude'],
                'longitude' => $payload['longitude'],
                'battery_percent' => $payload['battery_percent'] ?? null,
                'network_status' => $payload['network_status'] ?? null,
                'message' => $payload['message'] ?? null,
                'severity' => 'CRITICAL',
                'status' => 'ACTIVE',
            ]
        );

        if ($sos->wasRecentlyCreated) {
            SosCreated::dispatch($sos);
        }

        return $sos->id;
    }

    private function updateIncident(array $payload): string
    {
        $incident = Incident::where('uuid', $payload['uuid'])->firstOrFail();
        $incident->update(array_intersect_key($payload, array_flip([
            'title', 'description', 'severity', 'status', 'type', 'location_accuracy',
        ])));

        return $incident->id;
    }
}
