<?php

namespace App\Events;

use App\Models\Incident;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;

class IncidentVerified
{
    use Dispatchable;

    public function __construct(public Incident $incident, public User $actor, public bool $rejected = false) {}
}
