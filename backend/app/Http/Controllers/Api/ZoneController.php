<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreZoneRequest;
use App\Http\Requests\UpdateZoneRequest;
use App\Http\Resources\EmergencyZoneResource;
use App\Models\EmergencyZone;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ZoneController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $this->authorize('viewAny', EmergencyZone::class);

        $paginator = EmergencyZone::query()->orderBy('name')->paginate(20);

        return $this->paginatedResponse(EmergencyZoneResource::class, $paginator);
    }

    public function store(StoreZoneRequest $request)
    {
        $data = $request->validated();

        $zone = EmergencyZone::create([
            'uuid' => $data['uuid'] ?? (string) Str::uuid(),
            'name' => $data['name'],
            'type' => $data['type'],
            'polygon' => $data['polygon'],
            'description' => $data['description'] ?? null,
            'active' => $data['active'] ?? true,
        ]);

        return $this->success(new EmergencyZoneResource($zone), 'Zone created', 201);
    }

    public function update(UpdateZoneRequest $request, EmergencyZone $zone)
    {
        $zone->update($request->validated());

        return $this->success(new EmergencyZoneResource($zone), 'Zone updated');
    }
}
