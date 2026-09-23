<?php

namespace App\Policies;

use App\Models\SosRequest;
use App\Models\User;

class SosPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isResponder() || $user->isCitizen();
    }

    public function view(User $user, SosRequest $sos): bool
    {
        return $user->isAdmin() || $user->isResponder() || $sos->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        // Per contract, citizens raise SOS. Responders/admins may also self-report an SOS.
        return in_array($user->role, [User::ROLE_CITIZEN, User::ROLE_RESPONDER, User::ROLE_ADMIN], true);
    }

    public function acknowledge(User $user, SosRequest $sos): bool
    {
        return $user->isAdmin() || $user->isResponder();
    }

    public function assign(User $user, SosRequest $sos): bool
    {
        return $user->isAdmin();
    }

    public function resolve(User $user, SosRequest $sos): bool
    {
        return $user->isAdmin() || $user->isResponder();
    }
}
