<?php

namespace Tests\Feature\Payments;

use App\Enums\PaymentAttemptStatus;
use App\Enums\VoteOrderStatus;
use App\Models\PaymentAttempt;
use App\Models\VoteLedgerEntry;
use App\Models\VoteOrder;
use App\Models\Voter;
use App\Services\Payments\FakeGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FailureAndRetryTest extends TestCase
{
    use OpensVoting, RefreshDatabase;

    public function test_failed_webhook_marks_order_failed_but_keeps_context(): void
    {
        $order = VoteOrder::factory()->paymentPending()->create(['vote_qty' => 25]);
        $attempt = PaymentAttempt::factory()->pending()->create([
            'vote_order_id' => $order->id,
            'amount_minor' => $order->amount_minor,
        ]);

        $this->postJson('/webhooks/santimpay', [
            'reference' => $attempt->gateway_reference,
            'status' => 'failed',
            'failure_reason' => 'insufficient balance',
        ], [FakeGateway::SIGNATURE_HEADER => FakeGateway::VALID_SIGNATURE])->assertOk();

        $order->refresh();
        $this->assertSame(VoteOrderStatus::Failed, $order->status);
        // Nominee + quantity context retained for Try Again.
        $this->assertSame(25, $order->vote_qty);
        $this->assertSame(PaymentAttemptStatus::Failed, $attempt->fresh()->status);
        $this->assertSame(0, VoteLedgerEntry::query()->count());
    }

    public function test_retry_creates_a_new_attempt_with_a_new_reference(): void
    {
        $this->openVotingWindow();

        $order = VoteOrder::factory()->failed()->create();
        $failed = PaymentAttempt::factory()->create([
            'vote_order_id' => $order->id,
            'status' => PaymentAttemptStatus::Failed,
            'amount_minor' => $order->amount_minor,
        ]);

        $response = $this->actingAs($order->voter, 'voter')
            ->post("/en/orders/{$order->reference}/retry");

        $response->assertStatus(302); // gateway handoff redirect

        $order->refresh();
        $this->assertSame(VoteOrderStatus::PaymentPending, $order->status);
        $this->assertSame(2, $order->paymentAttempts()->count());

        $latest = $order->paymentAttempts()->latest('id')->first();
        $this->assertNotSame($failed->gateway_reference, $latest->gateway_reference);
        $this->assertSame(PaymentAttemptStatus::Pending, $latest->status);
    }

    public function test_only_the_order_owner_can_retry(): void
    {
        $order = VoteOrder::factory()->failed()->create();
        $stranger = Voter::factory()->create();

        $this->actingAs($stranger, 'voter')
            ->post("/en/orders/{$order->reference}/retry")
            ->assertForbidden();
    }
}
