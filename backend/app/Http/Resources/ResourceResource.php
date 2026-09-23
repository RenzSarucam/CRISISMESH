<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResourceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'type' => $this->type,
            'description' => $this->description,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'availability' => $this->availability,
            'quantity' => $this->quantity,
            'contact' => $this->contact,
            'operating_hours' => $this->operating_hours,
            'verified' => $this->verified,
            'last_updated_at' => $this->last_updated_at,
        ];
    }
}
