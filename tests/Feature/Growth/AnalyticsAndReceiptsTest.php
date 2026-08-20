<?php

namespace Tests\Feature\Growth;

use App\Models\AnalyticsEvent;
use App\Models\PaymentAttempt;
use App\Models\VoteOrder;
use App\Models\Voter;
use App\Notifications\VoteReceiptNotification;
use App\Services\Payments\FakeGateway;
use App\Services\Sms\FakeSmsSender;
use App\Services\Sms\SmsSender;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AnalyticsAndReceiptsTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_beacon_records_whitelisted_events(): void
    {
        $this->postJson('/events', ['event' => 'home_view'])->assertOk();

        $event = AnalyticsEvent::query()->sole();
        $this->assertSame('home_view', $event->event_name);
    }

    public function test_client_beacon_rejects_unknown_event_names(): void
    {
        $this->postJson('/events', ['event' => 'made_up_event'])->assertStatus(422);

        $this->assertSame(0, AnalyticsEvent::query()->count());
    }

    public function test_finalized_payment_sends_receipt_and_records_server_events(): void
    {
        Notification::fake();

        $voter = Voter::factory()->withVerifiedPhone()->create();
        $order = VoteOrder::factory()->paymentPending()->create([
            'voter_id' => $voter->id,
            'vote_qty' => 5,
            'amount_minor' => 5000,
        ]);
        $attempt = PaymentAttempt::factory()->pending()->create([
            'vote_order_id' => $order->id,
            'amount_minor' => 5000,
        ]);

        $this->postJson('/webhooks/santimpay', [
            'reference' => $attempt->gateway_reference,
            'status' => 'success',
            'amount_minor' => 5000,
        ], [FakeGateway::SIGNATURE_HEADER => FakeGateway::VALID_SIGNATURE])->assertOk();

        Notification::assertSentTo($voter, VoteReceiptNotification::class);

        $this->assertTrue(
            AnalyticsEvent::query()->where('event_name', 'vote_finalized')->exists(),
        );
    }

    public function test_receipt_sms_contains_the_order_details(): void
    {
        $voter = Voter::factory()->withVerifiedPhone()->create();
        $order = VoteOrder::factory()->success()->create([
            'voter_id' => $voter->id,
            'vote_qty' => 5,
            'amount_minor' => 5000,
        ]);

        $voter->notify(new VoteReceiptNotification($order->load('nominee')));

        /** @var FakeSmsSender $sms */
        $sms = app(SmsSender::class);
        $message = $sms->lastMessageFor($voter->phone);

        $this->assertNotNull($message);
        $this->assertStringContainsString('5 votes', $message);
        $this->assertStringContainsString($order->nominee->display_name, $message);
        $this->assertStringContainsString($order->reference, $message);
    }
}
