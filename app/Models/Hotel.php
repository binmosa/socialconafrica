<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Hotel extends Model
{
    use HasTranslations;

    /** @var list<string> */
    public array $translatable = ['note'];

    protected $guarded = [];
}
