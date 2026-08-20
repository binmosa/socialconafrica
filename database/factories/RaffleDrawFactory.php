<?php

namespace Database\Factories;

use App\Models\RaffleDraw;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RaffleDraw>
 */
class RaffleDrawFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $monday = now()->startOfWeek();

        return [
            'week_key' => $monday->format('o-\WW').'-'.fake()->unique()->numberBetween(1, 9999),
            'opens_at' => $monday,
            'closes_at' => $monday->addDays(4)->setTime(18, 0),
            'draw_at' => $monday->addDays(4)->setTime(20, 0),
            'status' => 'SCHEDULED',
            'prize_config' => [
                ['tier' => 'PHONE', 'label' => 'Smartphone', 'count' => 7],
                ['tier' => 'GRAND', 'label' => 'Premium Smartphone', 'count' => 1],
            ],
        ];
    }

    public function open(): static
    {
        return $this->state(fn (): array => [
            'status' => 'OPEN',
            'opens_at' => now()->subDay(),
            'closes_at' => now()->addDay(),
            'draw_at' => now()->addDays(2),
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn (): array => [
            'status' => 'CLOSED',
            'opens_at' => now()->subDays(5),
            'closes_at' => now()->subHour(),
            'draw_at' => now()->addHour(),
        ]);
    }
}
