<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

class AwardCategory extends Model
{
    use HasTranslations;

    /** @var list<string> */
    public array $translatable = ['name', 'description'];

    protected $guarded = [];

    public function nominees(): HasMany
    {
        return $this->hasMany(Nominee::class)->orderBy('sort_order');
    }
}
