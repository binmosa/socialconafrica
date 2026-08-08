<?php

namespace App\Http\Controllers;

use App\Models\AwardCategory;
use Inertia\Inertia;
use Inertia\Response;

class AwardController extends Controller
{
    public function index(): Response
    {
        $locale = app()->getLocale();

        return Inertia::render('site/awards', [
            'meta' => ['title' => __('site.awards.meta_title')],
            'categories' => AwardCategory::orderBy('sort_order')
                ->get()
                ->map(fn (AwardCategory $category): array => [
                    'slug' => $category->slug,
                    'name' => $category->getTranslation('name', $locale),
                    'description' => $category->getTranslation('description', $locale),
                    'icon' => $category->icon,
                ]),
        ]);
    }
}
