<?php

namespace App\Models;

use App\Enums\VoteLedgerEventType;
use Database\Factories\VoteLedgerEntryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

/**
 * Append-only ledger: the source of truth for all vote totals.
 * Rows are never updated or deleted; corrections are new reversing entries.
 *
 * @property int $id
 * @property int|null $vote_order_id
 * @property int $nominee_id
 * @property int|null $category_id
 * @property VoteLedgerEventType $event_type
 * @property int $vote_delta
 * @property string|null $reason
 * @property int|null $actor_id
 * @property string|null $ledger_key
 */
#[Fillable(['vote_order_id', 'nominee_id', 'category_id', 'event_type', 'vote_delta', 'reason', 'actor_id', 'ledger_key'])]
class VoteLedgerEntry extends Model
{
    /** @use HasFactory<VoteLedgerEntryFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    protected static function booted(): void
    {
        static::updating(function (): never {
            throw new LogicException('Vote ledger entries are append-only and cannot be updated.');
        });

        static::deleting(function (): never {
            throw new LogicException('Vote ledger entries are append-only and cannot be deleted.');
        });
    }

    /**
     * @return BelongsTo<VoteOrder, $this>
     */
    public function voteOrder(): BelongsTo
    {
        return $this->belongsTo(VoteOrder::class);
    }

    /**
     * @return BelongsTo<Nominee, $this>
     */
    public function nominee(): BelongsTo
    {
        return $this->belongsTo(Nominee::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'event_type' => VoteLedgerEventType::class,
        ];
    }
}
