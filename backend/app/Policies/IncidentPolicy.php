<?php

namespace App\Policies;

use App\Models\Incident;
use App\Models\User;

class IncidentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Incident $incident): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [User::ROLE_CITIZEN, User::ROLE_RESPONDER, User::ROLE_ADMIN], true);
    }

    public function update(User $user, Incident $incident): bool
    {
        if ($user->isAdmin() || $user->isResponder()) {
            return true;
        }

        // Citizens may only edit their own, not-yet-verified reports.
        return $user->isCitizen()
            && $incident->reporter_id === $user->id
            && $incident->verification_status === 'UNVERIFIED';
    }

    public function verify(User $user, Incident $incident): bool
    {
        return $user->isAdmin() || $user->isResponder();
    }

    public function assign(User $user, Incident $incident): bool
    {
        return $user->isAdmin();
    }

    public function resolve(User $user, Incident $incident): bool
    {
        return $user->isAdmin() || $user->isResponder();
    }
}
