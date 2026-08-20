<?php

namespace App\Models;

use App\Enums\RaffleWinnerStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $raffle_draw_id
 * @property int $raffle_entry_id
 * @property int $voter_id
 * @property string $prize_tier
 * @property string $prize_label
 * @property Carbon $selected_at
 * @property Carbon|null $published_at
 * @property RaffleWinnerStatus $status
 */
#[Fillable(['raffle_draw_id', 'raffle_entry_id', 'voter_id', 'prize_tier', 'prize_label', 'selected_at', 'published_at', 'status'])]
class RaffleWinner extends Model
{
    /**
     * @return BelongsTo<RaffleDraw, $this>
     */
    public function draw(): BelongsTo
    {
        return $this->belongsTo(RaffleDraw::class, 'raffle_draw_id');
    }

    /**
     * @return BelongsTo<RaffleEntry, $this>
     */
    public function entry(): BelongsTo
    {
        return $this->belongsTo(RaffleEntry::class, 'raffle_entry_id');
    }

    /**
     * @return BelongsTo<Voter, $this>
     */
    public function voter(): BelongsTo
    {
        return $this->belongsTo(Voter::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'selected_at' => 'datetime',
            'published_at' => 'datetime',
            'status' => RaffleWinnerStatus::class,
        ];
    }
}
