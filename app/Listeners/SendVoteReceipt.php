<?php

namespace App\Listeners;

use App\Events\VoteFinalized;
use App\Models\VoteOrder;
use App\Notifications\VoteReceiptNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendVoteReceipt implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(VoteFinalized $event): void
    {
        $order = VoteOrder::query()->with(['voter', 'nominee'])->find($event->voteOrderId);

        if ($order === null) {
            return;
        }

        $order->voter->notify(new VoteReceiptNotification($order));
    }
}
