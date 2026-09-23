<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEvacuationCenterRequest;
use App\Http\Requests\UpdateEvacuationCenterRequest;
use App\Http\Resources\EvacuationCenterResource;
use App\Models\EvacuationCenter;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EvacuationCenterController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $this->authorize('viewAny', EvacuationCenter::class);

        $paginator = EvacuationCenter::query()->orderBy('name')->paginate(20);

        return $this->paginatedResponse(EvacuationCenterResource::class, $paginator);
    }

    public function store(StoreEvacuationCenterRequest $request)
    {
        $data = $request->validated();

        $center = EvacuationCenter::create([
            'uuid' => $data['uuid'] ?? (string) Str::uuid(),
            'name' => $data['name'],
            'address' => $data['address'] ?? null,
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'capacity' => $data['capacity'],
            'current_occupancy' => $data['current_occupancy'] ?? 0,
            'contact' => $data['contact'] ?? null,
            'status' => $data['status'] ?? 'OPEN',
            'facilities' => $data['facilities'] ?? [],
            'verified' => $data['verified'] ?? false,
        ]);

        return $this->success(new EvacuationCenterResource($center), 'Evacuation center created', 201);
    }

    public function update(UpdateEvacuationCenterRequest $request, EvacuationCenter $evacuation_center)
    {
        $evacuation_center->update($request->validated());

        return $this->success(new EvacuationCenterResource($evacuation_center), 'Evacuation center updated');
    }

    public function destroy(Request $request, EvacuationCenter $evacuation_center)
    {
        $this->authorize('delete', $evacuation_center);

        $evacuation_center->delete();

        return $this->success(null, 'Evacuation center deleted');
    }
}
