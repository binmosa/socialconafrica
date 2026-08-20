<?php

namespace Database\Factories;

use App\Models\RaffleDraw;
use App\Models\RaffleEntry;
use App\Models\VoteOrder;
use App\Models\Voter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RaffleEntry>
 */
class RaffleEntryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'raffle_draw_id' => RaffleDraw::factory(),
            'voter_id' => Voter::factory(),
            'vote_order_id' => VoteOrder::factory(),
            'status' => 'ELIGIBLE',
        ];
    }
}
