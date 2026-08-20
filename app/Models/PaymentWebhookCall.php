<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $gateway
 * @property string|null $gateway_reference
 * @property array<string, mixed> $payload
 * @property array<string, mixed>|null $headers
 * @property bool $signature_valid
 * @property Carbon|null $processed_at
 * @property string|null $error
 */
#[Fillable(['gateway', 'gateway_reference', 'payload', 'headers', 'signature_valid', 'processed_at', 'error'])]
class PaymentWebhookCall extends Model
{
    use Prunable;

    public const UPDATED_AT = null;

    /**
     * @return Builder<PaymentWebhookCall>
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<', now()->subDays(90));
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'headers' => 'array',
            'signature_valid' => 'boolean',
            'processed_at' => 'datetime',
        ];
    }
}
