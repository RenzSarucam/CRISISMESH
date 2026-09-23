<?php

namespace App\Http\Resources;

use App\Services\DuplicateDetectionService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IncidentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $viewer = $request->user();
        $isOwner = $viewer && $this->reporter_id === $viewer->id;
        $viewerIsPrivileged = $viewer && ($viewer->isAdmin() || $viewer->isResponder());
        $fullPrecision = $isOwner || $viewerIsPrivileged;

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'reporter_id' => $this->reporter_id,
            'reporter_name' => $this->reporter?->name,
            'device_id' => $this->device_id,
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'latitude' => $fullPrecision ? $this->latitude : round((float) $this->latitude, 3),
            'longitude' => $fullPrecision ? $this->longitude : round((float) $this->longitude, 3),
            'location_accuracy' => $this->location_accuracy,
            'severity' => $this->severity,
            'status' => $this->status,
            'verification_status' => $this->verification_status,
            'source' => $this->source,
            'created_offline' => $this->created_offline,
            'synced_at' => $this->synced_at,
            'verified_by' => $this->verified_by,
            'verified_at' => $this->verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'possible_duplicates' => app(DuplicateDetectionService::class)->findPossibleDuplicates($this->resource),
        ];
    }
}
