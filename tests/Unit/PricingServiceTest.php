<?php

namespace Tests\Unit;

use App\Services\Pricing\PricingService;
use InvalidArgumentException;
use Tests\TestCase;

class PricingServiceTest extends TestCase
{
    private function service(): PricingService
    {
        return app(PricingService::class);
    }

    public function test_one_vote_costs_ten_etb(): void
    {
        $quote = $this->service()->quote(1);

        $this->assertSame(1, $quote->voteQty);
        $this->assertSame(1000, $quote->amountMinor);
        $this->assertSame('ETB', $quote->currency);
        $this->assertSame('v1-flat-1000', $quote->pricingVersion);
    }

    public function test_presets_match_spec_quantities(): void
    {
        $quantities = array_map(fn ($q) => $q->voteQty, $this->service()->presets());

        $this->assertSame([1, 2, 3, 5, 10, 25, 50, 100], $quantities);
        $this->assertSame(100_000, $this->service()->presets()[7]->amountMinor);
    }

    public function test_custom_amount_resolves_to_whole_votes(): void
    {
        $quote = $this->service()->resolveCustomAmount(15_000); // 150 ETB

        $this->assertSame(15, $quote->voteQty);
        $this->assertSame(15_000, $quote->amountMinor);
    }

    public function test_custom_amount_below_minimum_is_rejected(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->service()->resolveCustomAmount(500); // 5 ETB < 10 ETB minimum
    }

    public function test_custom_amount_not_resolving_to_whole_votes_is_rejected(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->service()->resolveCustomAmount(1500); // 15 ETB → 1.5 votes
    }

    public function test_zero_and_negative_quantities_are_rejected(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->service()->quote(0);
    }
}
