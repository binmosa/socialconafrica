<?php

namespace Tests\Feature\Payments;

use App\Enums\PaymentAttemptStatus;
use App\Enums\VoteOrderStatus;
use App\Models\Nominee;
use App\Models\VoteOrder;
use App\Models\Voter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use OpensVoting, RefreshDatabase;

    public function test_guest_is_sent_to_login_and_intent_is_preserved(): void
    {
        $this->openVotingWindow();
        $nominee = Nominee::factory()->create();

        $this->get("/en/vote/{$nominee->share_slug}/checkout?qty=5")
            ->assertRedirect(route('login', ['locale' => 'en']));

        $this->assertStringContainsString(
            'qty=5',
            (string) session('vote.intent.return_path'),
        );
    }

    public function test_checkout_page_renders_presets_for_a_voter(): void
    {
        $this->openVotingWindow();
        $nominee = Nominee::factory()->create();
        $voter = Voter::factory()->create();

        $this->actingAs($voter, 'voter')
            ->get("/en/vote/{$nominee->share_slug}/checkout?qty=5")
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('checkout/select')
                ->has('presets', 8)
                ->where('initialQty', 5)
                ->where('unitPriceMinor', 1000)
            );
    }

    public function test_checkout_is_refused_when_voting_is_closed(): void
    {
        $this->closeVotingWindow();
        $nominee = Nominee::factory()->create();
        $voter = Voter::factory()->create();

        $this->actingAs($voter, 'voter')
            ->get("/en/vote/{$nominee->share_slug}/checkout")
            ->assertRedirect(route('nominees.show', ['locale' => 'en', 'nominee' => $nominee->share_slug]));
    }

    public function test_placing_an_order_creates_order_and_attempt_and_redirects_to_gateway(): void
    {
        $this->openVotingWindow();
        $nominee = Nominee::factory()->create();
        $voter = Voter::factory()->create();

        $response = $this->actingAs($voter, 'voter')
            ->post("/en/vote/{$nominee->share_slug}/orders", ['qty' => 5, 'utm_source' => 'tiktok']);

        // Gateway handoff: a plain redirect for non-Inertia requests.
        $response->assertStatus(302);

        $order = VoteOrder::query()->sole();
        $this->assertSame(VoteOrderStatus::PaymentPending, $order->status);
        $this->assertSame(5, $order->vote_qty);
        $this->assertSame(5000, $order->amount_minor);
        $this->assertSame('v1-flat-1000', $order->pricing_version);
        $this->assertSame(['utm_source' => 'tiktok'], $order->meta);

        $attempt = $order->paymentAttempts()->sole();
        $this->assertSame(PaymentAttemptStatus::Pending, $attempt->status);
        $this->assertSame(5000, $attempt->amount_minor);
        $this->assertStringStartsWith('ace-', $attempt->gateway_reference);

        $this->assertStringContainsString(
            "/en/orders/{$order->reference}/return",
            (string) $response->headers->get('Location'),
        );
    }

    public function test_custom_amount_must_resolve_to_whole_votes(): void
    {
        $this->openVotingWindow();
        $nominee = Nominee::factory()->create();
        $voter = Voter::factory()->create();

        $this->actingAs($voter, 'voter')
            ->post("/en/vote/{$nominee->share_slug}/orders", ['amount_etb' => 15])
            ->assertSessionHasErrors('amount_etb');

        $this->actingAs($voter, 'voter')
            ->post("/en/vote/{$nominee->share_slug}/orders", ['amount_etb' => 5])
            ->assertSessionHasErrors('amount_etb');

        $this->assertSame(0, VoteOrder::query()->count());
    }

    public function test_order_creation_is_refused_when_voting_closed(): void
    {
        $this->closeVotingWindow();
        $nominee = Nominee::factory()->create();
        $voter = Voter::factory()->create();

        $this->actingAs($voter, 'voter')
            ->from("/en/vote/{$nominee->share_slug}")
            ->post("/en/vote/{$nominee->share_slug}/orders", ['qty' => 1])
            ->assertRedirect("/en/vote/{$nominee->share_slug}");

        $this->assertSame(0, VoteOrder::query()->count());
    }

    public function test_blocked_voter_cannot_open_checkout(): void
    {
        $this->openVotingWindow();
        $nominee = Nominee::factory()->create();
        $voter = Voter::factory()->blocked()->create();

        $this->actingAs($voter, 'voter')
            ->get("/en/vote/{$nominee->share_slug}/checkout")
            ->assertForbidden();
    }
}
