<?php

namespace App\Models;

use Database\Factories\NomineeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

/**
 * @property int $id
 * @property string $display_name
 * @property string $handle
 * @property string $share_slug
 * @property string|null $image_path
 * @property string $status
 * @property string|null $city
 * @property string|null $social_profile_url
 * @property string|null $bio
 * @property array<string, mixed>|null $metadata
 */
#[Fillable(['display_name', 'handle', 'share_slug', 'image_path', 'status', 'city', 'social_profile_url', 'bio', 'metadata', 'enriched_at'])]
class Nominee extends Model
{
    /** @use HasFactory<NomineeFactory> */
    use HasFactory, HasTranslations;

    /** @var array<int, string> */
    public array $translatable = ['bio'];

    /**
     * @return BelongsToMany<Category, $this>
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    /**
     * @return HasMany<NomineeVoteCounter, $this>
     */
    public function voteCounters(): HasMany
    {
        return $this->hasMany(NomineeVoteCounter::class);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'ACTIVE');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'enriched_at' => 'datetime',
        ];
    }
}
