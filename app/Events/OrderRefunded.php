<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;

class OrderRefunded
{
    use Dispatchable;

    public function __construct(public readonly int $voteOrderId) {}
}
