<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $phone
 * @property string $code_hash
 * @property string $purpose
 * @property int $attempts
 * @property Carbon $expires_at
 * @property Carbon|null $consumed_at
 */
#[Fillable(['phone', 'code_hash', 'purpose', 'attempts', 'expires_at', 'consumed_at'])]
class PhoneOtp extends Model
{
    use Prunable;

    public const UPDATED_AT = null;

    /**
     * @return Builder<PhoneOtp>
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<', now()->subDay());
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'consumed_at' => 'datetime',
        ];
    }
}
