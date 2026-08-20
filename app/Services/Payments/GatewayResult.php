<?php

namespace App\Services\Payments;

readonly class GatewayResult
{
    /**
     * @param  'success'|'failed'|'pending'|'unknown'  $status
     * @param  array<string, mixed>  $raw
     */
    public function __construct(
        public string $gatewayReference,
        public string $status,
        public array $raw = [],
        public ?int $amountMinor = null,
        public ?string $failureReason = null,
    ) {}

    public function isSuccess(): bool
    {
        return $this->status === 'success';
    }

    public function isFailure(): bool
    {
        return $this->status === 'failed';
    }

    public function isAmbiguous(): bool
    {
        return $this->status === 'pending' || $this->status === 'unknown';
    }
}
