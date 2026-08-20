<?php

namespace Database\Factories;

use App\Models\Voter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Voter>
 */
class VoterFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'display_name' => fake()->name(),
            'phone' => null,
            'phone_verified_at' => null,
            'email' => fake()->unique()->safeEmail(),
            'status' => 'ACTIVE',
            'risk_status' => 'NORMAL',
            'locale' => 'en',
        ];
    }

    public function withVerifiedPhone(): static
    {
        return $this->state(fn (): array => [
            'phone' => '+2519'.fake()->unique()->numerify('########'),
            'phone_verified_at' => now(),
        ]);
    }

    public function blocked(): static
    {
        return $this->state(fn (): array => ['risk_status' => 'BLOCKED']);
    }

    public function stepUpRequired(): static
    {
        return $this->state(fn (): array => ['risk_status' => 'STEP_UP_REQUIRED']);
    }
}
