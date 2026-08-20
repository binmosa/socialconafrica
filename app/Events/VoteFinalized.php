<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;

class VoteFinalized
{
    use Dispatchable;

    public function __construct(public readonly int $voteOrderId) {}
}
