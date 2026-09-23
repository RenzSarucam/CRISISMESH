<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    use HasFactory, HasUuidPrimaryKey;

    public const TYPES = [
        'MEDICAL', 'FIRE', 'FLOOD', 'LANDSLIDE', 'ROAD_BLOCKAGE', 'POWER_OUTAGE',
        'WATER_SHORTAGE', 'MISSING_PERSON', 'SECURITY', 'EARTHQUAKE', 'STORM', 'OTHER',
    ];

    public const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    public const STATUSES = ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'];

    public const VERIFICATION_STATUSES = [
        'UNVERIFIED', 'COMMUNITY_CONFIRMED', 'RESPONDER_VERIFIED', 'ADMIN_VERIFIED', 'FALSE_REPORT',
    ];

    public const SOURCES = ['USER', 'RESPONDER', 'ADMIN', 'SYSTEM'];

    protected $fillable = [
        'uuid', 'reporter_id', 'device_id', 'type', 'title', 'description',
        'latitude', 'longitude', 'location_accuracy', 'severity', 'status',
        'verification_status', 'source', 'created_offline', 'synced_at',
        'verified_by', 'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'location_accuracy' => 'float',
            'created_offline' => 'boolean',
            'synced_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function confirmations()
    {
        return $this->hasMany(IncidentConfirmation::class);
    }
}
