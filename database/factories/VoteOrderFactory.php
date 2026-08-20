<?php

namespace Database\Factories;

use App\Models\Nominee;
use App\Models\VoteOrder;
use App\Models\Voter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VoteOrder>
 */
class VoteOrderFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $qty = fake()->randomElement([1, 2, 3, 5, 10, 25, 50, 100]);
        $unit = 1000;

        return [
            'voter_id' => Voter::factory(),
            'nominee_id' => Nominee::factory(),
            'category_id' => null,
            'vote_qty' => $qty,
            'unit_price_minor' => $unit,
            'amount_minor' => $qty * $unit,
            'currency' => 'ETB',
            'pricing_version' => 'v1-flat-1000',
            'status' => 'CREATED',
        ];
    }

    public function paymentPending(): static
    {
        return $this->state(fn (): array => ['status' => 'PAYMENT_PENDING']);
    }

    public function success(): static
    {
        return $this->state(fn (): array => [
            'status' => 'SUCCESS',
            'finalized_at' => now(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (): array => ['status' => 'FAILED']);
    }
}
