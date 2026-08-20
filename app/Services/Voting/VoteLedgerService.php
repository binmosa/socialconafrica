<?php

namespace App\Services\Voting;

use App\Enums\VoteLedgerEventType;
use App\Models\Nominee;
use App\Models\NomineeVoteCounter;
use App\Models\User;
use App\Models\VoteLedgerEntry;
use App\Models\VoteOrder;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Sole writer of the vote ledger and its counter projection.
 * Every write happens inside the caller's transaction; the counter is
 * bumped in the same transaction as the ledger insert so it can never
 * drift except through bugs — and drift is detectable + rebuildable.
 */
class VoteLedgerService
{
    public function credit(VoteOrder $order, string $ledgerKey): VoteLedgerEntry
    {
        $entry = VoteLedgerEntry::query()->create([
            'vote_order_id' => $order->id,
            'nominee_id' => $order->nominee_id,
            'category_id' => $order->category_id,
            'event_type' => VoteLedgerEventType::PurchaseCredit,
            'vote_delta' => $order->vote_qty,
            'ledger_key' => $ledgerKey,
        ]);

        $this->bumpCounter($order->nominee_id, $order->category_id, $order->vote_qty);

        return $entry;
    }

    public function debit(VoteOrder $order, string $ledgerKey, string $reason, ?User $actor = null): VoteLedgerEntry
    {
        $entry = VoteLedgerEntry::query()->create([
            'vote_order_id' => $order->id,
            'nominee_id' => $order->nominee_id,
            'category_id' => $order->category_id,
            'event_type' => VoteLedgerEventType::RefundDebit,
            'vote_delta' => -$order->vote_qty,
            'reason' => $reason,
            'actor_id' => $actor?->id,
            'ledger_key' => $ledgerKey,
        ]);

        $this->bumpCounter($order->nominee_id, $order->category_id, -$order->vote_qty);

        return $entry;
    }

    /**
     * Manual admin adjustment; always requires a reason and an actor.
     */
    public function adjust(Nominee $nominee, int $voteDelta, string $reason, User $actor): VoteLedgerEntry
    {
        if (trim($reason) === '') {
            throw new InvalidArgumentException('Admin adjustments require a reason.');
        }

        return DB::transaction(function () use ($nominee, $voteDelta, $reason, $actor): VoteLedgerEntry {
            $entry = VoteLedgerEntry::query()->create([
                'nominee_id' => $nominee->id,
                'category_id' => null,
                'event_type' => VoteLedgerEventType::AdminAdjustment,
                'vote_delta' => $voteDelta,
                'reason' => $reason,
                'actor_id' => $actor->id,
            ]);

            $this->bumpCounter($nominee->id, null, $voteDelta);

            return $entry;
        });
    }

    private function bumpCounter(int $nomineeId, ?int $categoryId, int $delta): void
    {
        $counter = NomineeVoteCounter::query()
            ->where('nominee_id', $nomineeId)
            ->where('category_id', $categoryId)
            ->lockForUpdate()
            ->first();

        if ($counter === null) {
            NomineeVoteCounter::query()->create([
                'nominee_id' => $nomineeId,
                'category_id' => $categoryId,
                'total_votes' => max(0, $delta),
                'total_reached_at' => now(),
            ]);

            return;
        }

        $counter->update([
            'total_votes' => max(0, $counter->total_votes + $delta),
            'total_reached_at' => now(),
        ]);
    }
}
