<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SosRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $viewer = $request->user();
        $isOwner = $viewer && $this->user_id === $viewer->id;
        $viewerIsPrivileged = $viewer && ($viewer->isAdmin() || $viewer->isResponder());
        $fullPrecision = $isOwner || $viewerIsPrivileged;

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'user_id' => $this->user_id,
            'user_name' => $this->user?->name,
            'device_id' => $this->device_id,
            // SOS exact location is never exposed to citizens other than their own.
            'latitude' => $fullPrecision ? $this->latitude : round((float) $this->latitude, 3),
            'longitude' => $fullPrecision ? $this->longitude : round((float) $this->longitude, 3),
            'battery_percent' => $this->battery_percent,
            'network_status' => $this->network_status,
            'message' => $this->message,
            'severity' => $this->severity,
            'status' => $this->status,
            'acknowledged_by' => $this->acknowledged_by,
            'acknowledged_at' => $this->acknowledged_at,
            'assigned_responder_id' => $this->assigned_responder_id,
            'resolved_at' => $this->resolved_at,
            'created_at' => $this->created_at,
        ];
    }
}
