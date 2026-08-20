<?php

namespace Database\Factories;

use App\Models\AuthIdentity;
use App\Models\Voter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AuthIdentity>
 */
class AuthIdentityFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'voter_id' => Voter::factory(),
            'provider' => 'google',
            'provider_subject_id' => fake()->unique()->uuid(),
            'provider_metadata' => null,
            'linked_at' => now(),
        ];
    }

    public function telegram(): static
    {
        return $this->state(fn (): array => [
            'provider' => 'telegram',
            'provider_subject_id' => (string) fake()->unique()->randomNumber(9),
        ]);
    }

    public function phone(string $phone): static
    {
        return $this->state(fn (): array => [
            'provider' => 'phone',
            'provider_subject_id' => $phone,
        ]);
    }
}
