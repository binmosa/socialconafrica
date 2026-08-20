<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Cached projection of the vote ledger; rebuildable at any time.
 *
 * @property int $id
 * @property int $nominee_id
 * @property int|null $category_id
 * @property int $total_votes
 * @property Carbon|null $total_reached_at
 */
#[Fillable(['nominee_id', 'category_id', 'total_votes', 'total_reached_at'])]
class NomineeVoteCounter extends Model
{
    /**
     * @return BelongsTo<Nominee, $this>
     */
    public function nominee(): BelongsTo
    {
        return $this->belongsTo(Nominee::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_reached_at' => 'datetime',
        ];
    }
}
