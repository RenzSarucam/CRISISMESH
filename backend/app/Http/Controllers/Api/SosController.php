<?php

namespace App\Http\Controllers\Api;

use App\Events\SosAcknowledged;
use App\Events\SosCreated;
use App\Events\SosResolved;
use App\Http\Controllers\Controller;
use App\Http\Requests\AssignSosRequest;
use App\Http\Requests\StoreSosRequest;
use App\Http\Resources\SosRequestResource;
use App\Models\SosRequest as SosRequestModel;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SosController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $this->authorize('viewAny', SosRequestModel::class);

        $user = $request->user();

        $query = SosRequestModel::query()->with('user:id,name');

        if ($user->isCitizen()) {
            // Citizens may only ever list their own SOS requests.
            $query->where('user_id', $user->id);
        } elseif ($request->boolean('mine')) {
            $query->where('user_id', $user->id);
        }

        $paginator = $query->orderByDesc('created_at')->paginate(15);

        return $this->paginatedResponse(SosRequestResource::class, $paginator);
    }

    public function store(StoreSosRequest $request)
    {
        $this->authorize('create', SosRequestModel::class);

        $data = $request->validated();
        $clientUuid = $data['uuid'] ?? (string) Str::uuid();

        $existing = SosRequestModel::where('uuid', $clientUuid)->first();
        if ($existing) {
            return $this->success(new SosRequestResource($existing), 'SOS already recorded', 200);
        }

        $sos = SosRequestModel::create([
            'uuid' => $clientUuid,
            'user_id' => $request->user()->id,
            'device_id' => $data['device_id'] ?? $request->user()->device_id,
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'battery_percent' => $data['battery_percent'] ?? null,
            'network_status' => $data['network_status'] ?? null,
            'message' => $data['message'] ?? null,
            'severity' => 'CRITICAL',
            'status' => 'ACTIVE',
        ]);

        SosCreated::dispatch($sos);

        return $this->success(new SosRequestResource($sos), 'SOS raised', 201);
    }

    public function show(Request $request, SosRequestModel $sos)
    {
        $this->authorize('view', $sos);

        return $this->success(new SosRequestResource($sos));
    }

    public function acknowledge(Request $request, SosRequestModel $sos)
    {
        $this->authorize('acknowledge', $sos);

        $sos->update([
            'status' => 'ACKNOWLEDGED',
            'acknowledged_by' => $request->user()->id,
            'acknowledged_at' => now(),
        ]);

        SosAcknowledged::dispatch($sos, $request->user());

        return $this->success(new SosRequestResource($sos), 'SOS acknowledged');
    }

    public function assign(AssignSosRequest $request, SosRequestModel $sos)
    {
        $sos->update([
            'assigned_responder_id' => $request->validated()['responder_id'],
            'status' => 'RESPONDER_ASSIGNED',
        ]);

        return $this->success(new SosRequestResource($sos), 'SOS assigned');
    }

    public function resolve(Request $request, SosRequestModel $sos)
    {
        $this->authorize('resolve', $sos);

        $sos->update([
            'status' => 'RESOLVED',
            'resolved_at' => now(),
        ]);

        SosResolved::dispatch($sos, $request->user());

        return $this->success(new SosRequestResource($sos), 'SOS resolved');
    }
}
