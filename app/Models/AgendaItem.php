<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Translatable\HasTranslations;

class AgendaItem extends Model
{
    use HasTranslations;

    /** @var list<string> */
    public array $translatable = ['title', 'description', 'location'];

    protected $guarded = [];

    public function day(): BelongsTo
    {
        return $this->belongsTo(AgendaDay::class, 'agenda_day_id');
    }
}
