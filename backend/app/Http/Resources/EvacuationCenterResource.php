<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvacuationCenterResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'address' => $this->address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'capacity' => $this->capacity,
            'current_occupancy' => $this->current_occupancy,
            'contact' => $this->contact,
            'status' => $this->status,
            'facilities' => $this->facilities,
            'verified' => $this->verified,
            'updated_at' => $this->updated_at,
        ];
    }
}
