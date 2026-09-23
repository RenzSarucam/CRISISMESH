<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SosRequest extends Model
{
    use HasFactory, HasUuidPrimaryKey;

    public const STATUSES = ['ACTIVE', 'ACKNOWLEDGED', 'RESPONDER_ASSIGNED', 'RESOLVED', 'CANCELLED'];

    protected $table = 'sos_requests';

    protected $fillable = [
        'uuid', 'user_id', 'device_id', 'latitude', 'longitude', 'battery_percent',
        'network_status', 'message', 'severity', 'status', 'acknowledged_by',
        'acknowledged_at', 'assigned_responder_id', 'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'battery_percent' => 'integer',
            'acknowledged_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function acknowledgedBy()
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }

    public function assignedResponder()
    {
        return $this->belongsTo(User::class, 'assigned_responder_id');
    }
}
