<?php

namespace App\Events;

use App\Models\SosRequest;
use Illuminate\Foundation\Events\Dispatchable;

class SosCreated
{
    use Dispatchable;

    public function __construct(public SosRequest $sos) {}
}
