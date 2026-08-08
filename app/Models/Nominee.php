<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Translatable\HasTranslations;

class Nominee extends Model
{
    use HasTranslations;

    /** @var list<string> */
    public array $translatable = ['bio'];

    protected $guarded = [];

    public function category(): BelongsTo
    {
        return $this->belongsTo(AwardCategory::class, 'award_category_id');
    }
}
