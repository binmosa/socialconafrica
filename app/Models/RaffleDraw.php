<?php

namespace App\Models;

use App\Enums\RaffleDrawStatus;
use Database\Factories\RaffleDrawFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $week_key
 * @property Carbon $opens_at
 * @property Carbon $closes_at
 * @property Carbon $draw_at
 * @property RaffleDrawStatus $status
 * @property array<int, array<string, mixed>> $prize_config
 * @property array<string, mixed>|null $audit_metadata
 * @property Carbon|null $published_at
 */
#[Fillable(['week_key', 'opens_at', 'closes_at', 'draw_at', 'status', 'prize_config', 'audit_metadata', 'published_at'])]
class RaffleDraw extends Model
{
    /** @use HasFactory<RaffleDrawFactory> */
    use HasFactory;

    /**
     * @return HasMany<RaffleEntry, $this>
     */
    public function entries(): HasMany
    {
        return $this->hasMany(RaffleEntry::class);
    }

    /**
     * @return HasMany<RaffleWinner, $this>
     */
    public function winners(): HasMany
    {
        return $this->hasMany(RaffleWinner::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'opens_at' => 'datetime',
            'closes_at' => 'datetime',
            'draw_at' => 'datetime',
            'status' => RaffleDrawStatus::class,
            'prize_config' => 'array',
            'audit_metadata' => 'array',
            'published_at' => 'datetime',
        ];
    }
}
