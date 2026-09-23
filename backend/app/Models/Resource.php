<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resource extends Model
{
    use HasFactory, HasUuidPrimaryKey;

    public const TYPES = [
        'WATER', 'FOOD', 'MEDICAL', 'SHELTER', 'POWER', 'CHARGING', 'FUEL', 'TRANSPORT', 'RESCUE_EQUIPMENT',
    ];

    public const AVAILABILITIES = ['AVAILABLE', 'LIMITED', 'UNAVAILABLE', 'UNKNOWN'];

    protected $fillable = [
        'uuid', 'name', 'type', 'description', 'latitude', 'longitude',
        'availability', 'quantity', 'contact', 'operating_hours', 'verified', 'last_updated_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'verified' => 'boolean',
            'last_updated_at' => 'datetime',
        ];
    }
}
