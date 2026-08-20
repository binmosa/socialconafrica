<?php

namespace Tests\Feature\DevTools;

use App\Enums\RaffleDrawStatus;
use App\Enums\VoteOrderStatus;
use App\Models\PaymentAttempt;
use App\Models\RaffleDraw;
use App\Models\VoteLedgerEntry;
use App\Models\VoteOrder;
use App\Services\Settings\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoCommandsTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_command_opens_voting_and_creates_consistent_confirmed_votes(): void
    {
        $this->artisan('ace:demo', ['--votes' => 5])->assertSuccessful();

        $this->assertTrue(app(SettingsService::class)->votingWindow()->isOpen());
        $this->assertSame(RaffleDrawStatus::Open, RaffleDraw::query()->latest('opens_at')->first()->status);

        $confirmed = VoteOrder::query()->where('status', VoteOrderStatus::Success)->count();
        $this->assertSame(5, $confirmed);
        // Every confirmed order went through the real finalizer: one ledger row each.
        $this->assertSame(5, VoteLedgerEntry::query()->count());
    }

    public function test_simulate_payment_confirms_the_latest_pending_order(): void
    {
        $order = VoteOrder::factory()->paymentPending()->create(['vote_qty' => 3, 'amount_minor' => 3000]);
        PaymentAttempt::factory()->pending()->create([
            'vote_order_id' => $order->id,
            'amount_minor' => 3000,
        ]);

        $this->artisan('ace:simulate-payment')->assertSuccessful();

        $this->assertSame(VoteOrderStatus::Success, $order->fresh()->status);
        $this->assertSame(1, VoteLedgerEntry::query()->count());
    }

    public function test_simulate_payment_can_fail_an_order(): void
    {
        $order = VoteOrder::factory()->paymentPending()->create();
        PaymentAttempt::factory()->pending()->create([
            'vote_order_id' => $order->id,
            'amount_minor' => $order->amount_minor,
        ]);

        $this->artisan('ace:simulate-payment', ['reference' => $order->reference, '--fail' => true])
            ->assertSuccessful();

        $this->assertSame(VoteOrderStatus::Failed, $order->fresh()->status);
        $this->assertSame(0, VoteLedgerEntry::query()->count());
    }
}
