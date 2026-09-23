<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncidentConfirmation extends Model
{
    use HasFactory, HasUuidPrimaryKey;

    public const TYPE_CONFIRM = 'CONFIRM';

    public const TYPE_REJECT = 'REJECT';

    public $timestamps = false;

    protected $fillable = [
        'incident_id', 'user_id', 'role_at_time', 'type', 'note', 'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function ($model) {
            $model->created_at ??= now();
        });
    }

    public function incident()
    {
        return $this->belongsTo(Incident::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
