<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreResourceRequest;
use App\Http\Requests\UpdateResourceRequest;
use App\Http\Resources\ResourceResource;
use App\Models\Resource as ResourceModel;
use App\Services\AuditLogService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ResourceController extends Controller
{
    use ApiResponse;

    public function __construct(private AuditLogService $auditLog) {}

    public function index(Request $request)
    {
        $this->authorize('viewAny', ResourceModel::class);

        $query = ResourceModel::query();

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }
        if ($request->filled('availability')) {
            $query->where('availability', $request->string('availability'));
        }

        $paginator = $query->orderBy('name')->paginate(20);

        return $this->paginatedResponse(ResourceResource::class, $paginator);
    }

    public function store(StoreResourceRequest $request)
    {
        $data = $request->validated();

        $resource = ResourceModel::create([
            'uuid' => $data['uuid'] ?? (string) Str::uuid(),
            'name' => $data['name'],
            'type' => $data['type'],
            'description' => $data['description'] ?? null,
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'availability' => $data['availability'] ?? 'AVAILABLE',
            'quantity' => $data['quantity'] ?? null,
            'contact' => $data['contact'] ?? null,
            'operating_hours' => $data['operating_hours'] ?? null,
            'verified' => $data['verified'] ?? false,
            'last_updated_at' => now(),
        ]);

        $this->auditLog->log($request->user(), AuditLogService::RESOURCE_UPDATED, 'Resource', $resource->id, $request);

        return $this->success(new ResourceResource($resource), 'Resource created', 201);
    }

    public function update(UpdateResourceRequest $request, ResourceModel $resource)
    {
        $resource->update([...$request->validated(), 'last_updated_at' => now()]);

        $this->auditLog->log($request->user(), AuditLogService::RESOURCE_UPDATED, 'Resource', $resource->id, $request);

        return $this->success(new ResourceResource($resource), 'Resource updated');
    }

    public function destroy(Request $request, ResourceModel $resource)
    {
        $this->authorize('delete', $resource);

        $resource->delete();

        $this->auditLog->log($request->user(), AuditLogService::RESOURCE_UPDATED, 'Resource', $resource->id, $request);

        return $this->success(null, 'Resource deleted');
    }
}
