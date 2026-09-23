<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SyncOperation extends Model
{
    use HasFactory, HasUuidPrimaryKey;

    public const TYPE_CREATE_INCIDENT = 'CREATE_INCIDENT';

    public const TYPE_CREATE_SOS = 'CREATE_SOS';

    public const TYPE_UPDATE_INCIDENT = 'UPDATE_INCIDENT';

    public const STATUS_PENDING = 'PENDING';

    public const STATUS_APPLIED = 'APPLIED';

    public const STATUS_FAILED = 'FAILED';

    protected $fillable = [
        'device_id', 'operation_id', 'type', 'payload', 'status', 'result_entity_id', 'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'processed_at' => 'datetime',
        ];
    }
}
