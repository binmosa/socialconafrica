<?php

namespace App\Jobs;

use App\Enums\RaffleDrawStatus;
use App\Models\RaffleDraw;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;

/**
 * Applies due schedule transitions: SCHEDULED→OPEN at opens_at and
 * OPEN→CLOSED at the admin-configured cutoff. Draw execution itself is a
 * deliberate admin action, never automatic.
 */
class TransitionRaffleDraws implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $opened = RaffleDraw::query()
            ->where('status', RaffleDrawStatus::Scheduled)
            ->where('opens_at', '<=', now())
            ->get();

        foreach ($opened as $draw) {
            $draw->update(['status' => RaffleDrawStatus::Open]);
        }

        $closed = RaffleDraw::query()
            ->where('status', RaffleDrawStatus::Open)
            ->where('closes_at', '<=', now())
            ->get();

        foreach ($closed as $draw) {
            $draw->update(['status' => RaffleDrawStatus::Closed]);
        }

        if ($opened->isNotEmpty() || $closed->isNotEmpty()) {
            Cache::forget('ace-active-draw');
        }
    }
}
