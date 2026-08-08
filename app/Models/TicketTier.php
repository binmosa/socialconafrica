<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class TicketTier extends Model
{
    use HasTranslations;

    /** @var list<string> */
    public array $translatable = ['name', 'subtitle', 'perks', 'badge'];

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
