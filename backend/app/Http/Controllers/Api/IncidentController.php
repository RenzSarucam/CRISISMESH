<?php

namespace App\Http\Controllers\Api;

use App\Events\IncidentCreated;
use App\Events\IncidentVerified;
use App\Http\Controllers\Controller;
use App\Http\Requests\AssignIncidentRequest;
use App\Http\Requests\StoreIncidentRequest;
use App\Http\Requests\UpdateIncidentRequest;
use App\Http\Requests\VerifyIncidentRequest;
use App\Http\Resources\IncidentResource;
use App\Models\Incident;
use App\Models\IncidentConfirmation;
use App\Services\AiSuggestionService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class IncidentController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Incident::class);

        $query = Incident::query()->with('reporter:id,name');

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }
        if ($request->filled('severity')) {
            $query->where('severity', $request->string('severity'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('verification_status')) {
            $query->where('verification_status', $request->string('verification_status'));
        }
        if ($request->filled('since')) {
            $query->where('created_at', '>=', $request->string('since'));
        }
        if ($request->filled('bbox')) {
            // bbox=minLng,minLat,maxLng,maxLat
            $parts = array_map('floatval', explode(',', (string) $request->string('bbox')));
            if (count($parts) === 4) {
                [$minLng, $minLat, $maxLng, $maxLat] = $parts;
                $query->whereBetween('latitude', [$minLat, $maxLat])
                    ->whereBetween('longitude', [$minLng, $maxLng]);
            }
        }

        $paginator = $query->orderByDesc('created_at')->paginate(15);

        return $this->paginatedResponse(IncidentResource::class, $paginator);
    }

    public function store(StoreIncidentRequest $request, AiSuggestionService $ai)
    {
        $this->authorize('create', Incident::class);

        $data = $request->validated();
        $clientUuid = $data['uuid'] ?? (string) Str::uuid();

        // Upsert by client uuid as an idempotency safety net.
        $existing = Incident::where('uuid', $clientUuid)->first();
        if ($existing) {
            return $this->success(new IncidentResource($existing), 'Incident already recorded', 200);
        }

        $incident = Incident::create([
            'uuid' => $clientUuid,
            'reporter_id' => $request->user()->id,
            'device_id' => $data['device_id'] ?? $request->user()->device_id,
            'type' => $data['type'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'location_accuracy' => $data['location_accuracy'] ?? null,
            'severity' => $data['severity'],
            'status' => 'REPORTED',
            'verification_status' => 'UNVERIFIED',
            'source' => $data['source'] ?? 'USER',
            'created_offline' => $data['created_offline'] ?? false,
            'synced_at' => now(),
        ]);

        // Non-authoritative categorization suggestion; never treated as verification.
        $ai->categorize($incident->title.' '.$incident->description);

        IncidentCreated::dispatch($incident, $request->user());

        return $this->success(new IncidentResource($incident), 'Incident reported', 201);
    }

    public function show(Request $request, Incident $incident)
    {
        $this->authorize('view', $incident);

        return $this->success(new IncidentResource($incident));
    }

    public function update(UpdateIncidentRequest $request, Incident $incident)
    {
        $incident->update($request->validated());

        return $this->success(new IncidentResource($incident), 'Incident updated');
    }

    public function verify(VerifyIncidentRequest $request, Incident $incident)
    {
        $data = $request->validated();
        $user = $request->user();

        $incident->update([
            'verification_status' => $data['verification_status'],
            'verified_by' => $user->id,
            'verified_at' => now(),
        ]);

        $rejected = $data['verification_status'] === 'FALSE_REPORT';

        IncidentConfirmation::create([
            'incident_id' => $incident->id,
            'user_id' => $user->id,
            'role_at_time' => $user->role,
            'type' => $rejected ? IncidentConfirmation::TYPE_REJECT : IncidentConfirmation::TYPE_CONFIRM,
            'note' => $data['note'] ?? null,
        ]);

        IncidentVerified::dispatch($incident, $user, $rejected);

        return $this->success(new IncidentResource($incident), 'Incident verification updated');
    }

    public function assign(AssignIncidentRequest $request, Incident $incident)
    {
        // Assignment is tracked via status transition; no dedicated column in the contract
        // beyond verified_by/verification, so we move the incident to ACKNOWLEDGED.
        $incident->update(['status' => 'ACKNOWLEDGED']);

        return $this->success(new IncidentResource($incident), 'Incident assigned');
    }

    public function resolve(Request $request, Incident $incident)
    {
        $this->authorize('resolve', $incident);

        $incident->update(['status' => 'RESOLVED']);

        return $this->success(new IncidentResource($incident), 'Incident resolved');
    }
}
