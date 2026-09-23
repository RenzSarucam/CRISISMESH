<?php

namespace App\Events;

use App\Models\SosRequest;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;

class SosAcknowledged
{
    use Dispatchable;

    public function __construct(public SosRequest $sos, public User $actor) {}
}
