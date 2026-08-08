<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Speaker extends Model
{
    use HasTranslations;

    /** @var list<string> */
    public array $translatable = ['role', 'bio'];

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'socials' => 'array',
            'is_featured' => 'boolean',
        ];
    }
}
