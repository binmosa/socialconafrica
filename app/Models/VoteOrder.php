<?php

namespace App\Models;

use App\Enums\VoteOrderStatus;
use Database\Factories\VoteOrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $reference
 * @property int $voter_id
 * @property int $nominee_id
 * @property int|null $category_id
 * @property int $vote_qty
 * @property int $unit_price_minor
 * @property int $amount_minor
 * @property string $currency
 * @property string $pricing_version
 * @property VoteOrderStatus $status
 * @property Carbon|null $finalized_at
 * @property array<string, mixed>|null $meta
 */
#[Fillable(['voter_id', 'nominee_id', 'category_id', 'vote_qty', 'unit_price_minor', 'amount_minor', 'currency', 'pricing_version', 'status', 'finalized_at', 'meta'])]
class VoteOrder extends Model
{
    /** @use HasFactory<VoteOrderFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::creating(function (self $order): void {
            $order->reference ??= strtolower((string) Str::ulid());
        });
    }

    /**
     * @return BelongsTo<Voter, $this>
     */
    public function voter(): BelongsTo
    {
        return $this->belongsTo(Voter::class);
    }

    /**
     * @return BelongsTo<Nominee, $this>
     */
    public function nominee(): BelongsTo
    {
        return $this->belongsTo(Nominee::class);
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return HasMany<PaymentAttempt, $this>
     */
    public function paymentAttempts(): HasMany
    {
        return $this->hasMany(PaymentAttempt::class);
    }

    /**
     * @return HasOne<RaffleEntry, $this>
     */
    public function raffleEntry(): HasOne
    {
        return $this->hasOne(RaffleEntry::class);
    }

    /**
     * @return HasMany<VoteLedgerEntry, $this>
     */
    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(VoteLedgerEntry::class);
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => VoteOrderStatus::class,
            'finalized_at' => 'datetime',
            'meta' => 'array',
        ];
    }
}
