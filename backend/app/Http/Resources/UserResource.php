<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $viewer = $request->user();
        $isSelf = $viewer && $viewer->id === $this->id;
        $viewerIsPrivileged = $viewer && ($viewer->isAdmin() || $viewer->isResponder());

        // Citizens can never see other citizens' phone numbers.
        $showPhone = $isSelf || $viewerIsPrivileged;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $isSelf || $viewerIsPrivileged ? $this->email : null,
            'phone' => $showPhone ? $this->phone : null,
            'role' => $this->role,
            'emergency_contact' => $isSelf || $viewerIsPrivileged ? $this->emergency_contact : null,
            'avatar_url' => $this->avatar_url,
            'device_id' => $this->device_id,
            'last_active_at' => $this->last_active_at,
            'created_at' => $this->created_at,
        ];
    }
}
