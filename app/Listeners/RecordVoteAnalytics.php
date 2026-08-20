<?php

namespace App\Listeners;

use App\Events\OrderRefunded;
use App\Events\VoteFinalized;
use App\Models\VoteOrder;
use App\Services\Analytics\AnalyticsRecorder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class RecordVoteAnalytics implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(private readonly AnalyticsRecorder $recorder) {}

    public function handle(VoteFinalized|OrderRefunded $event): void
    {
        $order = VoteOrder::query()->find($event->voteOrderId);

        if ($order === null) {
            return;
        }

        $this->recorder->record(
            eventName: $event instanceof VoteFinalized ? 'vote_finalized' : 'payment_refunded',
            voterId: $order->voter_id,
            nomineeId: $order->nominee_id,
            properties: [
                'vote_qty' => $order->vote_qty,
                'amount_minor' => $order->amount_minor,
            ],
        );

        if ($event instanceof VoteFinalized && $order->raffleEntry !== null) {
            $this->recorder->record(
                eventName: 'raffle_entry_created',
                voterId: $order->voter_id,
                nomineeId: $order->nominee_id,
            );
        }
    }
}
