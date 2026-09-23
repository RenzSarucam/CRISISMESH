<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmergencyZone extends Model
{
    use HasFactory, HasUuidPrimaryKey;

    public const TYPES = ['FLOOD_ZONE', 'EVACUATION_ZONE', 'ROAD_CLOSED', 'HIGH_RISK', 'SAFE_ZONE'];

    protected $fillable = [
        'uuid', 'name', 'type', 'polygon', 'description', 'active',
    ];

    protected function casts(): array
    {
        return [
            'polygon' => 'array',
            'active' => 'boolean',
        ];
    }
}
