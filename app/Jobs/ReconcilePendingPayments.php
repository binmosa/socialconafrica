<?php

namespace App\Jobs;

use App\Enums\PaymentAttemptStatus;
use App\Enums\VoteOrderStatus;
use App\Models\PaymentAttempt;
use App\Services\Payments\PaymentConfirmationService;
use App\Services\Payments\PaymentGateway;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Resolves stale PENDING/UNKNOWN attempts via server-to-server status
 * lookup, feeding results through the same idempotent finalizer as the
 * webhook. Attempts past the TTL are expired.
 */
class ReconcilePendingPayments implements ShouldQueue
{
    use Queueable;

    public function handle(PaymentGateway $gateway, PaymentConfirmationService $confirmation): void
    {
        $staleAfter = now()->subMinutes((int) config('ace.payments.reconcile_after_minutes'));
        $expireBefore = now()->subHours((int) config('ace.payments.expire_after_hours'));

        $attempts = PaymentAttempt::query()
            ->whereIn('status', [PaymentAttemptStatus::Pending, PaymentAttemptStatus::Unknown])
            ->where('updated_at', '<', $staleAfter)
            ->orderBy('id')
            ->limit(200)
            ->get();

        foreach ($attempts as $attempt) {
            if ($attempt->created_at !== null && $attempt->created_at->isBefore($expireBefore)) {
                $this->expire($attempt);

                continue;
            }

            try {
                $confirmation->confirmFromGatewayResult($gateway->lookupStatus($attempt));
            } catch (Throwable $exception) {
                Log::error('Reconciliation failed for attempt', [
                    'attempt_id' => $attempt->id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }
    }

    private function expire(PaymentAttempt $attempt): void
    {
        $attempt->update(['status' => PaymentAttemptStatus::Expired]);

        $order = $attempt->voteOrder;

        $hasLiveAttempt = $order->paymentAttempts()
            ->whereIn('status', [PaymentAttemptStatus::Initiated, PaymentAttemptStatus::Pending, PaymentAttemptStatus::Unknown])
            ->exists();

        if (! $hasLiveAttempt && $order->status->canTransitionTo(VoteOrderStatus::Expired)) {
            $order->update(['status' => VoteOrderStatus::Expired]);
        }
    }
}
