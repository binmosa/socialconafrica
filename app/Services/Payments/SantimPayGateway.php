<?php

namespace App\Services\Payments;

use App\Models\PaymentAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * SantimPay driver.
 *
 * NOTE: request/response field names follow SantimPay's public gateway API
 * and MUST be verified against the merchant integration docs on the sandbox
 * before production launch. Votes are only ever allocated through
 * PaymentConfirmationService after this driver confirms a result
 * server-to-server; browser redirects carry no authority.
 */
class SantimPayGateway implements PaymentGateway
{
    public function name(): string
    {
        return 'santimpay';
    }

    public function initiate(PaymentAttempt $attempt, string $returnUrl): GatewayRedirect
    {
        $response = Http::baseUrl($this->baseUrl())
            ->asJson()
            ->post('/initiate-payment', [
                'id' => $attempt->gateway_reference,
                'amount' => $attempt->amount_minor / 100,
                'reason' => 'ACE Awards votes',
                'merchantId' => config('ace.payments.santimpay.merchant_id'),
                'signedToken' => $this->signedToken([
                    'amount' => $attempt->amount_minor / 100,
                    'paymentReason' => 'ACE Awards votes',
                    'merchantId' => config('ace.payments.santimpay.merchant_id'),
                    'generated' => time(),
                ]),
                'successRedirectUrl' => $returnUrl,
                'failureRedirectUrl' => $returnUrl,
                'cancelRedirectUrl' => $returnUrl,
                'notifyUrl' => route('webhooks.santimpay'),
            ]);

        $url = $response->json('url');

        if (! $response->successful() || ! is_string($url)) {
            throw new RuntimeException('SantimPay initiation failed: '.$response->body());
        }

        return new GatewayRedirect($url);
    }

    public function verifyWebhookSignature(Request $request): bool
    {
        $secret = (string) config('ace.payments.santimpay.webhook_secret');
        $signature = (string) $request->header('X-Signature', '');

        if ($secret === '' || $signature === '') {
            return false;
        }

        $expected = hash_hmac('sha256', $request->getContent(), $secret);

        return hash_equals($expected, $signature);
    }

    public function parseWebhook(Request $request): GatewayResult
    {
        $status = strtolower((string) $request->input('Status', $request->input('status', '')));

        return new GatewayResult(
            gatewayReference: (string) $request->input('thirdPartyId', $request->input('ID', '')),
            status: $this->normalizeStatus($status),
            raw: (array) $request->all(),
            amountMinor: $request->filled('totalAmount')
                ? (int) round(((float) $request->input('totalAmount')) * 100)
                : null,
            failureReason: $request->input('message'),
        );
    }

    public function lookupStatus(PaymentAttempt $attempt): GatewayResult
    {
        $response = Http::baseUrl($this->baseUrl())
            ->asJson()
            ->post('/fetch-transaction-status', [
                'id' => $attempt->gateway_reference,
                'merchantId' => config('ace.payments.santimpay.merchant_id'),
                'signedToken' => $this->signedToken([
                    'id' => $attempt->gateway_reference,
                    'merId' => config('ace.payments.santimpay.merchant_id'),
                    'generated' => time(),
                ]),
            ]);

        if (! $response->successful()) {
            return new GatewayResult($attempt->gateway_reference, 'unknown', (array) $response->json());
        }

        $status = strtolower((string) $response->json('Status', ''));

        return new GatewayResult(
            gatewayReference: $attempt->gateway_reference,
            status: $this->normalizeStatus($status),
            raw: (array) $response->json(),
            amountMinor: $response->json('totalAmount') !== null
                ? (int) round(((float) $response->json('totalAmount')) * 100)
                : null,
        );
    }

    /**
     * @return 'success'|'failed'|'pending'|'unknown'
     */
    private function normalizeStatus(string $status): string
    {
        return match ($status) {
            'completed', 'success', 'paid' => 'success',
            'failed', 'declined', 'cancelled', 'canceled', 'expired' => 'failed',
            'pending', 'processing', 'initiated' => 'pending',
            default => 'unknown',
        };
    }

    /**
     * @param  array<string, mixed>  $claims
     */
    private function signedToken(array $claims): string
    {
        $privateKey = (string) config('ace.payments.santimpay.private_key');

        $header = $this->base64Url((string) json_encode(['alg' => 'ES256', 'typ' => 'JWT']));
        $payload = $this->base64Url((string) json_encode($claims));

        $signature = '';
        $key = openssl_pkey_get_private($privateKey);

        if ($key === false || openssl_sign("{$header}.{$payload}", $signature, $key, OPENSSL_ALGO_SHA256) === false) {
            throw new RuntimeException('Unable to sign SantimPay token; check SANTIMPAY_PRIVATE_KEY.');
        }

        return "{$header}.{$payload}.".$this->base64Url($signature);
    }

    private function base64Url(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function baseUrl(): string
    {
        return (string) config('ace.payments.santimpay.base_url');
    }
}
