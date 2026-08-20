<?php

namespace App\Models;

use App\Enums\RaffleEntryStatus;
use Database\Factories\RaffleEntryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $raffle_draw_id
 * @property int $voter_id
 * @property int $vote_order_id
 * @property RaffleEntryStatus $status
 */
#[Fillable(['raffle_draw_id', 'voter_id', 'vote_order_id', 'status'])]
class RaffleEntry extends Model
{
    /** @use HasFactory<RaffleEntryFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    /**
     * @return BelongsTo<RaffleDraw, $this>
     */
    public function draw(): BelongsTo
    {
        return $this->belongsTo(RaffleDraw::class, 'raffle_draw_id');
    }

    /**
     * @return BelongsTo<Voter, $this>
     */
    public function voter(): BelongsTo
    {
        return $this->belongsTo(Voter::class);
    }

    /**
     * @return BelongsTo<VoteOrder, $this>
     */
    public function voteOrder(): BelongsTo
    {
        return $this->belongsTo(VoteOrder::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => RaffleEntryStatus::class,
        ];
    }
}
