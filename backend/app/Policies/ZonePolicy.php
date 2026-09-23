<?php

namespace App\Policies;

use App\Models\EmergencyZone;
use App\Models\User;

class ZonePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, EmergencyZone $zone): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, EmergencyZone $zone): bool
    {
        return $user->isAdmin();
    }
}
