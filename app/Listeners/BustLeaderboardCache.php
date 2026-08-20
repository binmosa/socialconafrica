<?php

namespace App\Listeners;

use App\Events\OrderRefunded;
use App\Events\VoteFinalized;
use Illuminate\Support\Facades\Cache;

class BustLeaderboardCache
{
    public function handle(VoteFinalized|OrderRefunded $event): void
    {
        // Leaderboard reads are cached under a version key; bumping the
        // version invalidates every cached board at once.
        Cache::increment('ace-leaderboard-version');
    }
}
