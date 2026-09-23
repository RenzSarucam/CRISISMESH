<?php

namespace App\Policies;

use App\Models\EvacuationCenter;
use App\Models\User;

class EvacuationCenterPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, EvacuationCenter $center): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, EvacuationCenter $center): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, EvacuationCenter $center): bool
    {
        return $user->isAdmin();
    }
}
