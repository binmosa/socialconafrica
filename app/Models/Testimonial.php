<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Testimonial extends Model
{
    use HasTranslations;

    /** @var list<string> */
    public array $translatable = ['role', 'country', 'quote'];

    protected $guarded = [];
}
