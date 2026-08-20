<?php

namespace Database\Factories;

use App\Models\Nominee;
use App\Models\VoteLedgerEntry;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<VoteLedgerEntry>
 */
class VoteLedgerEntryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vote_order_id' => null,
            'nominee_id' => Nominee::factory(),
            'category_id' => null,
            'event_type' => 'PURCHASE_CREDIT',
            'vote_delta' => fake()->numberBetween(1, 100),
            'ledger_key' => 'test:'.Str::lower(Str::random(16)),
        ];
    }
}
