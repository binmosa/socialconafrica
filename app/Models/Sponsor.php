<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Translatable\HasTranslations;

class Sponsor extends Model
{
    use HasTranslations;

    /** @var list<string> */
    public array $translatable = ['description'];

    protected $guarded = [];

    public function tier(): BelongsTo
    {
        return $this->belongsTo(SponsorTier::class, 'sponsor_tier_id');
    }
}
