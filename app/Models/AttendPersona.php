<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class AttendPersona extends Model
{
    use HasTranslations;

    /** @var list<string> */
    public array $translatable = ['title', 'description'];

    protected $guarded = [];
}
