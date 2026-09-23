<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IncidentConfirmationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'incident_id' => $this->incident_id,
            'user_id' => $this->user_id,
            'role_at_time' => $this->role_at_time,
            'type' => $this->type,
            'note' => $this->note,
            'created_at' => $this->created_at,
        ];
    }
}
