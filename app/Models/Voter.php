<?php

namespace App\Models;

use App\Enums\VoterRiskStatus;
use App\Enums\VoterStatus;
use Database\Factories\VoterFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $display_name
 * @property string|null $phone
 * @property Carbon|null $phone_verified_at
 * @property string|null $email
 * @property VoterStatus $status
 * @property VoterRiskStatus $risk_status
 * @property string $locale
 * @property Carbon|null $last_login_at
 * @property int|null $merged_into_voter_id
 */
#[Fillable(['display_name', 'phone', 'phone_verified_at', 'email', 'status', 'risk_status', 'locale', 'last_login_at', 'merged_into_voter_id'])]
#[Hidden(['remember_token'])]
class Voter extends Authenticatable
{
    /** @use HasFactory<VoterFactory> */
    use HasFactory, Notifiable;

    /**
     * @return HasMany<AuthIdentity, $this>
     */
    public function authIdentities(): HasMany
    {
        return $this->hasMany(AuthIdentity::class);
    }

    /**
     * @return HasMany<VoteOrder, $this>
     */
    public function voteOrders(): HasMany
    {
        return $this->hasMany(VoteOrder::class);
    }

    /**
     * @return HasMany<RaffleEntry, $this>
     */
    public function raffleEntries(): HasMany
    {
        return $this->hasMany(RaffleEntry::class);
    }

    public function hasVerifiedPhone(): bool
    {
        return $this->phone !== null && $this->phone_verified_at !== null;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'phone_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'status' => VoterStatus::class,
            'risk_status' => VoterRiskStatus::class,
        ];
    }
}
