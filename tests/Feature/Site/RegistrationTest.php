<?php

namespace Tests\Feature\Site;

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'Amina',
            'last_name' => 'Bekele',
            'email' => 'amina@example.com',
            'phone' => '+251911223344',
            'country' => 'Ethiopia',
            'organization' => 'Creative Hub',
            'ticket_tier' => 'creator',
            'hotel' => 'skylight',
            'addons' => ['airport-transfer', 'gala-after-party'],
            'payment_method' => 'credit_card',
        ], $overrides);
    }

    public function test_registration_persists_attendee_order_and_items_with_server_computed_totals(): void
    {
        $response = $this->from('/en/register')->post('/en/register', $this->payload([
            // Client-sent price fields must be ignored.
            'total_minor' => 1,
            'priceMinor' => 1,
        ]));

        $response->assertRedirect('/en/register');
        $response->assertSessionHas('success');
        $response->assertSessionHas('orderReference');

        $this->assertDatabaseHas('attendees', ['email' => 'amina@example.com', 'locale' => 'en']);

        $order = Order::with('items')->firstOrFail();
        $this->assertSame('pending', $order->status);
        $this->assertSame('credit_card', $order->payment_method);
        // Creator $199.00 + transfer $40.00 + after-party $90.00 = $329.00.
        $this->assertSame(32900, $order->total_minor);
        $this->assertCount(3, $order->items);
        $this->assertSame(19900, $order->items->firstWhere('item_type', 'ticket')->unit_price_minor);
    }

    public function test_free_pass_without_addons_totals_zero(): void
    {
        $this->post('/en/register', $this->payload([
            'ticket_tier' => 'friday-free',
            'addons' => [],
        ]))->assertSessionHas('success');

        $this->assertSame(0, Order::firstOrFail()->total_minor);
    }

    public function test_vip_with_all_addons_totals_824(): void
    {
        $this->post('/en/register', $this->payload([
            'ticket_tier' => 'vip',
            'addons' => ['airport-transfer', 'addis-tour', 'advanced-workshop', 'gala-after-party'],
        ]))->assertSessionHas('success');

        // $499 + $40 + $75 + $120 + $90 = $824.00
        $this->assertSame(82400, Order::firstOrFail()->total_minor);
    }

    public function test_unknown_tier_or_payment_method_is_rejected(): void
    {
        $this->from('/en/register')
            ->post('/en/register', $this->payload(['ticket_tier' => 'ghost-pass']))
            ->assertSessionHasErrors('ticket_tier');

        $this->from('/en/register')
            ->post('/en/register', $this->payload(['payment_method' => 'cash']))
            ->assertSessionHasErrors('payment_method');

        $this->assertSame(0, Order::count());
    }
}
