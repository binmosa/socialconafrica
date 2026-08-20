<?php

namespace App\Services\Payments;

use App\Enums\PaymentAttemptStatus;
use App\Enums\VoteOrderStatus;
use App\Models\Category;
use App\Models\Nominee;
use App\Models\PaymentAttempt;
use App\Models\VoteOrder;
use App\Models\Voter;
use App\Services\Pricing\PriceQuote;
use App\Services\Settings\SettingsService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class OrderService
{
    public function __construct(
        private readonly SettingsService $settings,
        private readonly PaymentGateway $gateway,
    ) {}

    /**
     * @param  array<string, mixed>  $meta
     */
    public function createOrder(
        Voter $voter,
        Nominee $nominee,
        PriceQuote $quote,
        ?Category $category = null,
        array $meta = [],
    ): VoteOrder {
        if (! $this->settings->votingWindow()->isOpen()) {
            throw new RuntimeException('Voting is not open.');
        }

        if ($this->settings->paymentsPaused()) {
            throw new RuntimeException('Payments are temporarily paused.');
        }

        if ($nominee->status !== 'ACTIVE') {
            throw new RuntimeException('This nominee is not accepting votes.');
        }

        return VoteOrder::query()->create([
            'voter_id' => $voter->id,
            'nominee_id' => $nominee->id,
            'category_id' => $category?->id,
            'vote_qty' => $quote->voteQty,
            'unit_price_minor' => $quote->unitPriceMinor,
            'amount_minor' => $quote->amountMinor,
            'currency' => $quote->currency,
            'pricing_version' => $quote->pricingVersion,
            'status' => VoteOrderStatus::Created,
            'meta' => $meta === [] ? null : $meta,
        ]);
    }

    /**
     * Create a payment attempt for the order and hand off to the gateway.
     * Also used for Try Again: a FAILED order gets a fresh attempt while
     * keeping its nominee and quantity context.
     */
    public function startPayment(VoteOrder $order, string $returnUrl): GatewayRedirect
    {
        if (! in_array($order->status, [VoteOrderStatus::Created, VoteOrderStatus::Failed, VoteOrderStatus::PaymentPending], true)) {
            throw new RuntimeException('This order can no longer be paid.');
        }

        $attempt = DB::transaction(function () use ($order): PaymentAttempt {
            $attempt = $order->paymentAttempts()->create([
                'gateway' => $this->gateway->name(),
                'gateway_reference' => 'ace-'.strtolower((string) Str::ulid()),
                'status' => PaymentAttemptStatus::Initiated,
                'amount_minor' => $order->amount_minor,
            ]);

            $order->update(['status' => VoteOrderStatus::PaymentPending]);

            return $attempt;
        });

        $redirect = $this->gateway->initiate($attempt, $returnUrl);

        $attempt->update([
            'status' => PaymentAttemptStatus::Pending,
            'redirect_url' => $redirect->url,
        ]);

        return $redirect;
    }
}
