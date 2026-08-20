<?php

namespace App\Models;

use Database\Factories\AuthIdentityFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $voter_id
 * @property string $provider
 * @property string $provider_subject_id
 * @property array<string, mixed>|null $provider_metadata
 * @property Carbon $linked_at
 */
#[Fillable(['voter_id', 'provider', 'provider_subject_id', 'provider_metadata', 'linked_at'])]
class AuthIdentity extends Model
{
    /** @use HasFactory<AuthIdentityFactory> */
    use HasFactory;

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
            'provider_metadata' => 'array',
            'linked_at' => 'datetime',
        ];
    }
}
