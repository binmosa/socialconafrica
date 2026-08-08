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
            'payment_method' => 'credit_card',
        ], $overrides);
    }

    public function test_registration_persists_attendee_order_and_ticket_item(): void
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
        $this->assertNull($order->hotel_id);
        $this->assertSame(19900, $order->total_minor);
        $this->assertCount(1, $order->items);
        $this->assertSame('ticket', $order->items->first()->item_type);
        $this->assertSame(19900, $order->items->first()->unit_price_minor);
    }

    public function test_free_pass_totals_zero(): void
    {
        $this->post('/en/register', $this->payload(['ticket_tier' => 'friday-free']))
            ->assertSessionHas('success');

        $this->assertSame(0, Order::firstOrFail()->total_minor);
    }

    public function test_vip_pass_totals_499(): void
    {
        $this->post('/en/register', $this->payload(['ticket_tier' => 'vip']))
            ->assertSessionHas('success');

        $this->assertSame(49900, Order::firstOrFail()->total_minor);
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
