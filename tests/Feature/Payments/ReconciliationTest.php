<?php

namespace Tests\Feature\Payments;

use App\Enums\PaymentAttemptStatus;
use App\Enums\VoteOrderStatus;
use App\Jobs\ReconcilePendingPayments;
use App\Models\PaymentAttempt;
use App\Models\VoteLedgerEntry;
use App\Models\VoteOrder;
use App\Services\Payments\FakeGateway;
use App\Services\Payments\GatewayResult;
use App\Services\Payments\PaymentConfirmationService;
use App\Services\Payments\PaymentGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReconciliationTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGateway(): FakeGateway
    {
        return app(PaymentGateway::class);
    }

    public function test_stale_pending_attempt_is_resolved_via_status_lookup(): void
    {
        $order = VoteOrder::factory()->paymentPending()->create(['vote_qty' => 3, 'amount_minor' => 3000]);
        $attempt = PaymentAttempt::factory()->pending()->create([
            'vote_order_id' => $order->id,
            'amount_minor' => 3000,
        ]);
        PaymentAttempt::query()->whereKey($attempt->id)->update(['updated_at' => now()->subMinutes(10)]);

        $this->fakeGateway()->primeLookup(
            $attempt->gateway_reference,
            new GatewayResult($attempt->gateway_reference, 'success', amountMinor: 3000),
        );

        (new ReconcilePendingPayments)->handle($this->fakeGateway(), app(PaymentConfirmationService::class));

        $this->assertSame(VoteOrderStatus::Success, $order->fresh()->status);
        $this->assertSame(1, VoteLedgerEntry::query()->count());
    }

    public function test_lookup_failure_marks_attempt_failed(): void
    {
        $order = VoteOrder::factory()->paymentPending()->create();
        $attempt = PaymentAttempt::factory()->unknown()->create([
            'vote_order_id' => $order->id,
            'amount_minor' => $order->amount_minor,
        ]);
        PaymentAttempt::query()->whereKey($attempt->id)->update(['updated_at' => now()->subMinutes(10)]);

        $this->fakeGateway()->primeLookup(
            $attempt->gateway_reference,
            new GatewayResult($attempt->gateway_reference, 'failed'),
        );

        (new ReconcilePendingPayments)->handle($this->fakeGateway(), app(PaymentConfirmationService::class));

        $this->assertSame(PaymentAttemptStatus::Failed, $attempt->fresh()->status);
        $this->assertSame(VoteOrderStatus::Failed, $order->fresh()->status);
    }

    public function test_attempts_past_the_ttl_are_expired(): void
    {
        $order = VoteOrder::factory()->paymentPending()->create();
        $attempt = PaymentAttempt::factory()->pending()->create([
            'vote_order_id' => $order->id,
            'amount_minor' => $order->amount_minor,
        ]);
        PaymentAttempt::query()->whereKey($attempt->id)->update([
            'created_at' => now()->subHours(30),
            'updated_at' => now()->subHours(30),
        ]);

        (new ReconcilePendingPayments)->handle($this->fakeGateway(), app(PaymentConfirmationService::class));

        $this->assertSame(PaymentAttemptStatus::Expired, $attempt->fresh()->status);
        $this->assertSame(VoteOrderStatus::Expired, $order->fresh()->status);
        $this->assertSame(0, VoteLedgerEntry::query()->count());
    }

    public function test_fresh_pending_attempts_are_left_alone(): void
    {
        $order = VoteOrder::factory()->paymentPending()->create();
        $attempt = PaymentAttempt::factory()->pending()->create([
            'vote_order_id' => $order->id,
            'amount_minor' => $order->amount_minor,
        ]);

        (new ReconcilePendingPayments)->handle($this->fakeGateway(), app(PaymentConfirmationService::class));

        $this->assertSame(PaymentAttemptStatus::Pending, $attempt->fresh()->status);
    }
}
