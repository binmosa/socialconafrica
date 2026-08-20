<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\PaymentWebhookCall;
use App\Services\Payments\PaymentConfirmationService;
use App\Services\Payments\PaymentGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class SantimPayWebhookController extends Controller
{
    public function __invoke(
        Request $request,
        PaymentGateway $gateway,
        PaymentConfirmationService $confirmation,
    ): JsonResponse {
        $signatureValid = $gateway->verifyWebhookSignature($request);

        // Persist the raw call BEFORE any processing — forensic trail first.
        $call = PaymentWebhookCall::query()->create([
            'gateway' => $gateway->name(),
            'gateway_reference' => $request->input('reference')
                ?? $request->input('thirdPartyId')
                ?? $request->input('ID'),
            'payload' => (array) $request->all(),
            'headers' => collect($request->headers->all())->except(['cookie', 'authorization'])->all(),
            'signature_valid' => $signatureValid,
        ]);

        if (! $signatureValid) {
            return response()->json(['message' => 'Invalid signature.'], 401);
        }

        try {
            $confirmation->confirmFromGatewayResult($gateway->parseWebhook($request));
            $call->update(['processed_at' => now()]);
        } catch (Throwable $exception) {
            $call->update(['error' => $exception->getMessage()]);

            throw $exception;
        }

        return response()->json(['message' => 'ok']);
    }
}
