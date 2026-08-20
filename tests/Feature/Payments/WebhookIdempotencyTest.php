<?php

namespace Tests\Feature\Payments;

use App\Enums\PaymentAttemptStatus;
use App\Enums\VoteOrderStatus;
use App\Models\NomineeVoteCounter;
use App\Models\PaymentAttempt;
use App\Models\PaymentWebhookCall;
use App\Models\RaffleDraw;
use App\Models\RaffleEntry;
use App\Models\VoteLedgerEntry;
use App\Models\VoteOrder;
use App\Services\Payments\FakeGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebhookIdempotencyTest extends TestCase
{
    use OpensVoting, RefreshDatabase;

    /**
     * @return array{0: VoteOrder, 1: PaymentAttempt}
     */
    private function pendingOrder(): array
    {
        $order = VoteOrder::factory()->paymentPending()->create(['vote_qty' => 5, 'amount_minor' => 5000]);
        $attempt = PaymentAttempt::factory()->pending()->create([
            'vote_order_id' => $order->id,
            'amount_minor' => 5000,
        ]);

        return [$order, $attempt];
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function postWebhook(PaymentAttempt $attempt, array $overrides = [], string $signature = FakeGateway::VALID_SIGNATURE)
    {
        return $this->postJson('/webhooks/santimpay', [
            'reference' => $attempt->gateway_reference,
            'status' => 'success',
            'amount_minor' => $attempt->amount_minor,
            ...$overrides,
        ], [FakeGateway::SIGNATURE_HEADER => $signature]);
    }

    public function test_confirmed_webhook_finalizes_exactly_once(): void
    {
        RaffleDraw::factory()->open()->create();
        [$order, $attempt] = $this->pendingOrder();

        $this->postWebhook($attempt)->assertOk();

        $order->refresh();
        $this->assertSame(VoteOrderStatus::Success, $order->status);
        $this->assertNotNull($order->finalized_at);
        $this->assertSame(PaymentAttemptStatus::Succeeded, $attempt->fresh()->status);

        $ledger = VoteLedgerEntry::query()->sole();
        $this->assertSame(5, $ledger->vote_delta);
        $this->assertSame("purchase:{$order->id}", $ledger->ledger_key);

        $counter = NomineeVoteCounter::query()->sole();
        $this->assertSame(5, $counter->total_votes);

        $this->assertSame(1, RaffleEntry::query()->where('vote_order_id', $order->id)->count());
    }

    public function test_duplicate_webhook_is_a_no_op(): void
    {
        RaffleDraw::factory()->open()->create();
        [, $attempt] = $this->pendingOrder();

        $this->postWebhook($attempt)->assertOk();
        $this->postWebhook($attempt)->assertOk();
        $this->postWebhook($attempt)->assertOk();

        $this->assertSame(1, VoteLedgerEntry::query()->count());
        $this->assertSame(1, RaffleEntry::query()->count());
        $this->assertSame(5, NomineeVoteCounter::query()->sole()->total_votes);
    }

    public function test_invalid_signature_is_rejected_and_nothing_mutates(): void
    {
        [$order, $attempt] = $this->pendingOrder();

        $this->postWebhook($attempt, [], 'forged')->assertUnauthorized();

        $this->assertSame(VoteOrderStatus::PaymentPending, $order->fresh()->status);
        $this->assertSame(0, VoteLedgerEntry::query()->count());

        // The forged call is still logged for forensics.
        $call = PaymentWebhookCall::query()->sole();
        $this->assertFalse($call->signature_valid);
    }

    public function test_amount_mismatch_holds_the_attempt_for_reconciliation(): void
    {
        [$order, $attempt] = $this->pendingOrder();

        $this->postWebhook($attempt, ['amount_minor' => 100])->assertOk();

        $this->assertSame(PaymentAttemptStatus::Unknown, $attempt->fresh()->status);
        $this->assertSame(VoteOrderStatus::PaymentPending, $order->fresh()->status);
        $this->assertSame(0, VoteLedgerEntry::query()->count());
    }

    public function test_unknown_reference_is_accepted_without_side_effects(): void
    {
        $this->postJson('/webhooks/santimpay', [
            'reference' => 'ace-does-not-exist',
            'status' => 'success',
        ], [FakeGateway::SIGNATURE_HEADER => FakeGateway::VALID_SIGNATURE])->assertOk();

        $this->assertSame(0, VoteLedgerEntry::query()->count());
    }

    public function test_success_without_open_draw_still_counts_votes(): void
    {
        [$order, $attempt] = $this->pendingOrder();

        $this->postWebhook($attempt)->assertOk();

        $this->assertSame(VoteOrderStatus::Success, $order->fresh()->status);
        $this->assertSame(1, VoteLedgerEntry::query()->count());
        $this->assertSame(0, RaffleEntry::query()->count());
    }
}
