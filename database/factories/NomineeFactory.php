<?php

namespace Database\Factories;

use App\Models\Nominee;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Nominee>
 */
class NomineeFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->name();
        $handle = Str::slug($name);

        return [
            'display_name' => $name,
            'handle' => $handle,
            'share_slug' => $handle,
            'status' => 'ACTIVE',
            'city' => fake()->city(),
            'bio' => null,
            'metadata' => null,
        ];
    }

    public function hidden(): static
    {
        return $this->state(fn (): array => ['status' => 'HIDDEN']);
    }
}
