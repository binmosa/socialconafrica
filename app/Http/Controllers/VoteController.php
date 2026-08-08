<?php

namespace App\Http\Controllers;

use App\Models\AwardCategory;
use App\Models\Nominee;
use Inertia\Inertia;
use Inertia\Response;

class VoteController extends Controller
{
    public function index(): Response
    {
        $locale = app()->getLocale();

        return Inertia::render('site/vote', [
            'meta' => ['title' => __('site.vote.meta_title')],
            'votingOpen' => false,
            'categories' => AwardCategory::with(['nominees' => fn ($query) => $query->where('status', 'published')])
                ->orderBy('sort_order')
                ->get()
                ->map(fn (AwardCategory $category): array => [
                    'slug' => $category->slug,
                    'name' => $category->getTranslation('name', $locale),
                    'description' => $category->getTranslation('description', $locale),
                    'icon' => $category->icon,
                    'nominees' => $category->nominees->map(fn (Nominee $nominee): array => [
                        'name' => $nominee->name,
                        'country' => $nominee->country,
                        'photo' => $nominee->photo_path,
                    ]),
                ]),
        ]);
    }
}
