<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

class AgendaDay extends Model
{
    use HasTranslations;

    /** @var list<string> */
    public array $translatable = ['label', 'title'];

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(AgendaItem::class)->orderBy('sort_order');
    }
}
