<?php

namespace App\Services\Pricing;

use InvalidArgumentException;

/**
 * The single authority for vote pricing. The UI mirrors quotes for display
 * but never calculates the payable amount itself.
 */
class PricingService
{
    private const MAX_VOTES_PER_ORDER = 100_000;

    public function quote(int $voteQty): PriceQuote
    {
        if ($voteQty < 1 || $voteQty > self::MAX_VOTES_PER_ORDER) {
            throw new InvalidArgumentException('Vote quantity out of range.');
        }

        $unit = $this->unitPriceMinor();

        return new PriceQuote(
            voteQty: $voteQty,
            unitPriceMinor: $unit,
            amountMinor: $voteQty * $unit,
            currency: (string) config('ace.pricing.currency'),
            pricingVersion: (string) config('ace.pricing.version'),
        );
    }

    /**
     * Resolve a custom ETB amount (in minor units) to whole votes.
     * Minimum 10 ETB; only amounts resolving to whole votes are accepted.
     */
    public function resolveCustomAmount(int $amountMinor): PriceQuote
    {
        $unit = $this->unitPriceMinor();

        if ($amountMinor < (int) config('ace.pricing.minimum_amount_minor')) {
            throw new InvalidArgumentException('Amount is below the minimum.');
        }

        if ($amountMinor % $unit !== 0) {
            throw new InvalidArgumentException('Amount must resolve to whole votes.');
        }

        return $this->quote(intdiv($amountMinor, $unit));
    }

    /**
     * @return array<int, PriceQuote>
     */
    public function presets(): array
    {
        return array_map(
            fn (int $qty): PriceQuote => $this->quote($qty),
            (array) config('ace.pricing.preset_quantities'),
        );
    }

    public function unitPriceMinor(): int
    {
        return (int) config('ace.pricing.unit_price_minor');
    }
}
