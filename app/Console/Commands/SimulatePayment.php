<?php

namespace App\Console\Commands;

use App\Enums\PaymentAttemptStatus;
use App\Models\VoteOrder;
use App\Services\Payments\GatewayResult;
use App\Services\Payments\PaymentConfirmationService;
use Illuminate\Console\Command;

class SimulatePayment extends Command
{
    /**
     * @var string
     */
    protected $signature = 'ace:simulate-payment
        {reference? : Order reference (defaults to the most recent pending order)}
        {--fail : Simulate a failed payment instead of a successful one}';

    /**
     * @var string
     */
    protected $description = 'Local stand-in for the SantimPay webhook: confirms (or fails) a pending payment through the real idempotent finalizer';

    public function handle(PaymentConfirmationService $confirmation): int
    {
        if (app()->isProduction()) {
            $this->error('ace:simulate-payment is a local/dev tool and cannot run in production.');

            return self::FAILURE;
        }

        $order = $this->argument('reference') !== null
            ? VoteOrder::query()->where('reference', $this->argument('reference'))->first()
            : VoteOrder::query()->where('status', 'PAYMENT_PENDING')->latest('id')->first();

        if ($order === null) {
            $this->error('No matching pending order found. Start a checkout first, or pass an order reference.');

            return self::FAILURE;
        }

        $attempt = $order->paymentAttempts()
            ->whereIn('status', [PaymentAttemptStatus::Pending, PaymentAttemptStatus::Initiated, PaymentAttemptStatus::Unknown])
            ->latest('id')
            ->first();

        if ($attempt === null) {
            $this->error("Order {$order->reference} has no live payment attempt.");

            return self::FAILURE;
        }

        $confirmation->confirmFromGatewayResult(new GatewayResult(
            gatewayReference: $attempt->gateway_reference,
            status: $this->option('fail') ? 'failed' : 'success',
            raw: ['simulated' => true],
            amountMinor: $attempt->amount_minor,
            failureReason: $this->option('fail') ? 'Simulated failure' : null,
        ));

        $order->refresh();

        $this->info("Order {$order->reference}: {$order->status->value} ({$order->vote_qty} votes for nominee #{$order->nominee_id}).");
        $this->line('Refresh the payment status page in the browser to see it update.');

        return self::SUCCESS;
    }
}
