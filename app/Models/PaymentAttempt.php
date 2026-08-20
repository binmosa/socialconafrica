<?php

namespace App\Models;

use App\Enums\PaymentAttemptStatus;
use Database\Factories\PaymentAttemptFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $vote_order_id
 * @property string $gateway
 * @property string $gateway_reference
 * @property string $idempotency_key
 * @property PaymentAttemptStatus $status
 * @property int $amount_minor
 * @property string|null $redirect_url
 * @property array<string, mixed>|null $gateway_request
 * @property array<string, mixed>|null $gateway_result
 * @property Carbon|null $confirmed_at
 * @property Carbon|null $failed_at
 */
#[Fillable(['vote_order_id', 'gateway', 'gateway_reference', 'status', 'amount_minor', 'redirect_url', 'gateway_request', 'gateway_result', 'confirmed_at', 'failed_at'])]
class PaymentAttempt extends Model
{
    /** @use HasFactory<PaymentAttemptFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::creating(function (self $attempt): void {
            $attempt->idempotency_key ??= strtolower((string) Str::ulid());
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
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => PaymentAttemptStatus::class,
            'gateway_request' => 'array',
            'gateway_result' => 'array',
            'confirmed_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }
}
