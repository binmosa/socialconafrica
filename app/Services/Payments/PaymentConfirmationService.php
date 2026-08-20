<?php

namespace App\Services\Payments;

use App\Enums\PaymentAttemptStatus;
use App\Enums\VoteOrderStatus;
use App\Events\VoteFinalized;
use App\Models\PaymentAttempt;
use App\Models\VoteOrder;
use App\Services\Raffle\RaffleService;
use App\Services\Voting\VoteLedgerService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * The single, idempotent finalizer for payment results. Both the webhook
 * controller and the reconciliation job feed results through here — there
 * is no other code path that can allocate votes.
 *
 * Idempotency layers (defense in depth):
 *  1. lockForUpdate on the attempt + order serializes concurrent callbacks
 *  2. terminal-status guard turns replays into no-ops
 *  3. UNIQUE vote_ledger_entries.ledger_key blocks double credits
 *  4. UNIQUE raffle_entries.vote_order_id blocks double raffle entries
 */
class PaymentConfirmationService
{
    public function __construct(
        private readonly VoteLedgerService $ledger,
        private readonly RaffleService $raffle,
    ) {}

    public function confirmFromGatewayResult(GatewayResult $result): void
    {
        $finalizedOrderId = DB::transaction(function () use ($result): ?int {
            $attempt = PaymentAttempt::query()
                ->where('gateway_reference', $result->gatewayReference)
                ->lockForUpdate()
                ->first();

            if ($attempt === null) {
                Log::warning('Gateway result for unknown reference', ['reference' => $result->gatewayReference]);

                return null;
            }

            if ($attempt->status->isTerminal()) {
                return null; // duplicate delivery — already handled
            }

            /** @var VoteOrder $order */
            $order = VoteOrder::query()->whereKey($attempt->vote_order_id)->lockForUpdate()->firstOrFail();

            if ($result->isFailure()) {
                $attempt->update([
                    'status' => PaymentAttemptStatus::Failed,
                    'failed_at' => now(),
                    'gateway_result' => $result->raw,
                ]);

                if ($order->status === VoteOrderStatus::PaymentPending) {
                    $order->update(['status' => VoteOrderStatus::Failed]);
                }

                return null;
            }

            if ($result->isAmbiguous()) {
                $attempt->update([
                    'status' => PaymentAttemptStatus::Unknown,
                    'gateway_result' => $result->raw,
                ]);

                return null;
            }

            // Success path — never trust the reported amount blindly.
            if ($result->amountMinor !== null && $result->amountMinor !== $attempt->amount_minor) {
                Log::error('Gateway amount mismatch; holding for reconciliation', [
                    'attempt_id' => $attempt->id,
                    'expected' => $attempt->amount_minor,
                    'reported' => $result->amountMinor,
                ]);

                $attempt->update([
                    'status' => PaymentAttemptStatus::Unknown,
                    'gateway_result' => $result->raw,
                ]);

                return null;
            }

            if ($order->status === VoteOrderStatus::Success) {
                // Another attempt already finalized this order; record and stop.
                $attempt->update([
                    'status' => PaymentAttemptStatus::Succeeded,
                    'confirmed_at' => now(),
                    'gateway_result' => $result->raw,
                ]);

                return null;
            }

            $attempt->update([
                'status' => PaymentAttemptStatus::Succeeded,
                'confirmed_at' => now(),
                'gateway_result' => $result->raw,
            ]);

            $order->update([
                'status' => VoteOrderStatus::Success,
                'finalized_at' => now(),
            ]);

            $this->ledger->credit($order, "purchase:{$order->id}");
            $this->raffle->enterOrder($order);

            return $order->id;
        });

        if ($finalizedOrderId !== null) {
            DB::afterCommit(fn () => event(new VoteFinalized($finalizedOrderId)));
        }
    }
}
