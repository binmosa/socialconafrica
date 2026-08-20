<?php

namespace Tests\Feature\Payments;

use App\Enums\RaffleEntryStatus;
use App\Enums\VoteLedgerEventType;
use App\Enums\VoteOrderStatus;
use App\Models\NomineeVoteCounter;
use App\Models\RaffleDraw;
use App\Models\RaffleEntry;
use App\Models\User;
use App\Models\VoteLedgerEntry;
use App\Models\VoteOrder;
use App\Services\Payments\RefundService;
use App\Services\Voting\VoteLedgerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Tests\TestCase;

class RefundTest extends TestCase
{
    use RefreshDatabase;

    private function successfulOrder(): VoteOrder
    {
        $order = VoteOrder::factory()->success()->create(['vote_qty' => 10, 'amount_minor' => 10_000]);

        DB::transaction(function () use ($order): void {
            app(VoteLedgerService::class)->credit($order, "purchase:{$order->id}");
        });

        return $order;
    }

    public function test_refund_reverses_ledger_counter_and_raffle_entry(): void
    {
        $draw = RaffleDraw::factory()->open()->create();
        $order = $this->successfulOrder();
        $entry = RaffleEntry::factory()->create([
            'raffle_draw_id' => $draw->id,
            'voter_id' => $order->voter_id,
            'vote_order_id' => $order->id,
        ]);
        $admin = User::factory()->create();

        app(RefundService::class)->reverse($order, 'Chargeback confirmed by SantimPay', $admin);

        $order->refresh();
        $this->assertSame(VoteOrderStatus::Refunded, $order->status);

        $debit = VoteLedgerEntry::query()->where('event_type', VoteLedgerEventType::RefundDebit)->sole();
        $this->assertSame(-10, $debit->vote_delta);
        $this->assertSame("refund:{$order->id}", $debit->ledger_key);
        $this->assertSame($admin->id, $debit->actor_id);

        $this->assertSame(0, NomineeVoteCounter::query()->sole()->total_votes);
        $this->assertSame(RaffleEntryStatus::Void, $entry->fresh()->status);
    }

    public function test_refund_requires_a_successful_order(): void
    {
        $order = VoteOrder::factory()->paymentPending()->create();

        $this->expectException(RuntimeException::class);

        app(RefundService::class)->reverse($order, 'reason');
    }

    public function test_double_refund_is_impossible(): void
    {
        $order = $this->successfulOrder();

        app(RefundService::class)->reverse($order, 'first refund');

        $this->expectException(RuntimeException::class);

        app(RefundService::class)->reverse($order->fresh(), 'second refund');
    }
}
