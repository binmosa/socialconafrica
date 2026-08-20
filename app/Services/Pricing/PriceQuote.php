<?php

namespace App\Services\Pricing;

readonly class PriceQuote
{
    public function __construct(
        public int $voteQty,
        public int $unitPriceMinor,
        public int $amountMinor,
        public string $currency,
        public string $pricingVersion,
    ) {}

    /**
     * @return array{vote_qty: int, unit_price_minor: int, amount_minor: int, currency: string, pricing_version: string}
     */
    public function toArray(): array
    {
        return [
            'vote_qty' => $this->voteQty,
            'unit_price_minor' => $this->unitPriceMinor,
            'amount_minor' => $this->amountMinor,
            'currency' => $this->currency,
            'pricing_version' => $this->pricingVersion,
        ];
    }
}
