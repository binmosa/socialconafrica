<?php

namespace App\Services\Payments;

use App\Models\PaymentAttempt;
use Illuminate\Http\Request;

interface PaymentGateway
{
    /**
     * Stable driver key, stored on payment attempts.
     */
    public function name(): string;

    /**
     * Hand the attempt to the gateway; returns the checkout redirect.
     */
    public function initiate(PaymentAttempt $attempt, string $returnUrl): GatewayRedirect;

    /**
     * Authenticate an incoming webhook before any processing.
     */
    public function verifyWebhookSignature(Request $request): bool;

    /**
     * Parse a verified webhook payload into a normalized result.
     */
    public function parseWebhook(Request $request): GatewayResult;

    /**
     * Server-to-server status lookup for reconciliation.
     */
    public function lookupStatus(PaymentAttempt $attempt): GatewayResult;
}
