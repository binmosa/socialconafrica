<?php

namespace App\Services\Raffle;

use App\Enums\RaffleDrawStatus;
use App\Enums\RaffleEntryStatus;
use App\Models\RaffleDraw;
use App\Models\RaffleEntry;
use App\Models\VoteOrder;
use App\Services\Settings\SettingsService;

class RaffleService
{
    public function __construct(private readonly SettingsService $settings) {}

    /**
     * Create exactly one raffle entry for a successful transaction.
     * Silently no-ops when the raffle is disabled or no draw is open —
     * voting must never be blocked by the raffle module.
     */
    public function enterOrder(VoteOrder $order): ?RaffleEntry
    {
        if (! $this->settings->raffleEnabled()) {
            return null;
        }

        $draw = RaffleDraw::query()
            ->where('status', RaffleDrawStatus::Open)
            ->where('opens_at', '<=', now())
            ->where('closes_at', '>', now())
            ->orderBy('opens_at')
            ->first();

        if ($draw === null) {
            return null;
        }

        // vote_order_id is UNIQUE — the schema guarantees one entry per order.
        return RaffleEntry::query()->firstOrCreate(
            ['vote_order_id' => $order->id],
            [
                'raffle_draw_id' => $draw->id,
                'voter_id' => $order->voter_id,
                'status' => RaffleEntryStatus::Eligible,
            ],
        );
    }

    /**
     * Void the order's raffle entry after a refund, unless the draw has
     * already been executed — then the winner decision belongs to admins.
     */
    public function voidEntryForOrder(VoteOrder $order): void
    {
        $entry = RaffleEntry::query()
            ->where('vote_order_id', $order->id)
            ->with('draw')
            ->first();

        if ($entry === null) {
            return;
        }

        $drawExecuted = in_array($entry->draw->status, [RaffleDrawStatus::Drawn, RaffleDrawStatus::Published], true);

        if (! $drawExecuted) {
            $entry->update(['status' => RaffleEntryStatus::Void]);
        }
    }
}
