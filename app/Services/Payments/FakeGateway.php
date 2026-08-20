<?php

namespace App\Services\Payments;

use App\Models\PaymentAttempt;
use Illuminate\Http\Request;

/**
 * Development/test driver. Webhooks are authenticated with a static
 * header; lookups return whatever the test primed via primeLookup().
 */
class FakeGateway implements PaymentGateway
{
    public const SIGNATURE_HEADER = 'X-Fake-Signature';

    public const VALID_SIGNATURE = 'valid';

    /** @var array<string, GatewayResult> */
    private array $lookupResults = [];

    public function name(): string
    {
        return 'fake';
    }

    public function initiate(PaymentAttempt $attempt, string $returnUrl): GatewayRedirect
    {
        return new GatewayRedirect($returnUrl.'?gateway=fake');
    }

    public function verifyWebhookSignature(Request $request): bool
    {
        return $request->header(self::SIGNATURE_HEADER) === self::VALID_SIGNATURE;
    }

    public function parseWebhook(Request $request): GatewayResult
    {
        $status = (string) $request->input('status', 'unknown');

        return new GatewayResult(
            gatewayReference: (string) $request->input('reference'),
            status: in_array($status, ['success', 'failed', 'pending', 'unknown'], true) ? $status : 'unknown',
            raw: (array) $request->all(),
            amountMinor: $request->filled('amount_minor') ? (int) $request->input('amount_minor') : null,
            failureReason: $request->input('failure_reason'),
        );
    }

    public function lookupStatus(PaymentAttempt $attempt): GatewayResult
    {
        return $this->lookupResults[$attempt->gateway_reference]
            ?? new GatewayResult($attempt->gateway_reference, 'unknown');
    }

    public function primeLookup(string $gatewayReference, GatewayResult $result): void
    {
        $this->lookupResults[$gatewayReference] = $result;
    }
}
