<?php

namespace App\Jobs;

use App\Services\Voting\CounterRebuilder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Nightly drift alarm: compares the counter projection to ledger sums.
 * Findings are cached for the admin anomalies widget.
 */
class VerifyVoteCounters implements ShouldQueue
{
    use Queueable;

    public function handle(CounterRebuilder $rebuilder): void
    {
        $drift = $rebuilder->drift();

        Cache::put('ace-counter-drift', [
            'checked_at' => now()->toIso8601String(),
            'drift' => $drift,
        ], now()->addDays(2));

        if ($drift !== []) {
            Log::error('Vote counter drift detected', ['drift' => $drift]);
        }
    }
}
