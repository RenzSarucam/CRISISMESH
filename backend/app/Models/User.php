<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUuidPrimaryKey, Notifiable;

    public const ROLE_CITIZEN = 'citizen';

    public const ROLE_RESPONDER = 'responder';

    public const ROLE_ADMIN = 'admin';

    public const ROLES = [self::ROLE_CITIZEN, self::ROLE_RESPONDER, self::ROLE_ADMIN];

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'emergency_contact',
        'avatar_url',
        'device_id',
        'last_active_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_active_at' => 'datetime',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isResponder(): bool
    {
        return $this->role === self::ROLE_RESPONDER;
    }

    public function isCitizen(): bool
    {
        return $this->role === self::ROLE_CITIZEN;
    }

    public function device()
    {
        return $this->belongsTo(Device::class, 'device_id');
    }

    public function incidents()
    {
        return $this->hasMany(Incident::class, 'reporter_id');
    }

    public function sosRequests()
    {
        return $this->hasMany(SosRequest::class, 'user_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }
}
