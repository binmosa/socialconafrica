<?php

namespace Database\Factories;

use App\Models\PaymentAttempt;
use App\Models\VoteOrder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PaymentAttempt>
 */
class PaymentAttemptFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vote_order_id' => VoteOrder::factory(),
            'gateway' => 'fake',
            'gateway_reference' => 'ref-'.Str::lower(Str::random(20)),
            'status' => 'INITIATED',
            'amount_minor' => 1000,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (): array => ['status' => 'PENDING']);
    }

    public function succeeded(): static
    {
        return $this->state(fn (): array => [
            'status' => 'SUCCEEDED',
            'confirmed_at' => now(),
        ]);
    }

    public function unknown(): static
    {
        return $this->state(fn (): array => ['status' => 'UNKNOWN']);
    }
}
