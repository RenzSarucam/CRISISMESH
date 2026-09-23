<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvacuationCenter extends Model
{
    use HasFactory, HasUuidPrimaryKey;

    public const STATUSES = ['OPEN', 'FULL', 'CLOSED', 'UNKNOWN'];

    public $timestamps = false;

    protected $fillable = [
        'uuid', 'name', 'address', 'latitude', 'longitude', 'capacity',
        'current_occupancy', 'contact', 'status', 'facilities', 'verified', 'updated_at', 'created_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'facilities' => 'array',
            'verified' => 'boolean',
            'updated_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function ($model) {
            $model->created_at ??= now();
            $model->updated_at ??= now();
        });
        static::updating(function ($model) {
            $model->updated_at = now();
        });
    }
}
