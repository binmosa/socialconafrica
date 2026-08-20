<?php

namespace App\Services\Payments;

use App\Enums\VoteOrderStatus;
use App\Events\OrderRefunded;
use App\Models\User;
use App\Models\VoteOrder;
use App\Services\Raffle\RaffleService;
use App\Services\Voting\VoteLedgerService;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class RefundService
{
    public function __construct(
        private readonly VoteLedgerService $ledger,
        private readonly RaffleService $raffle,
    ) {}

    /**
     * Reverse a confirmed order: reversing ledger entry, counter decrement,
     * raffle entry void (per draw state), permanent audit context.
     */
    public function reverse(VoteOrder $order, string $reason, ?User $actor = null): void
    {
        if (trim($reason) === '') {
            throw new InvalidArgumentException('Refunds require a reason.');
        }

        DB::transaction(function () use ($order, $reason, $actor): void {
            $locked = VoteOrder::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== VoteOrderStatus::Success) {
                throw new RuntimeException('Only successful orders can be refunded.');
            }

            $this->ledger->debit($locked, "refund:{$locked->id}", $reason, $actor);
            $this->raffle->voidEntryForOrder($locked);

            $locked->update(['status' => VoteOrderStatus::Refunded]);
        });

        DB::afterCommit(fn () => event(new OrderRefunded($order->id)));
    }
}
