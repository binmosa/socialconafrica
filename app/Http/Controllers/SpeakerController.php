<?php

namespace App\Http\Controllers;

use App\Models\Speaker;
use Inertia\Inertia;
use Inertia\Response;

class SpeakerController extends Controller
{
    public function index(): Response
    {
        $locale = app()->getLocale();

        return Inertia::render('site/speakers', [
            'meta' => ['title' => __('site.speakers_page.meta_title')],
            'speakers' => Speaker::orderBy('sort_order')
                ->get()
                ->map(fn (Speaker $speaker): array => [
                    'name' => $speaker->name,
                    'role' => $speaker->getTranslation('role', $locale),
                    'photo' => $speaker->photo_path,
                    'category' => $speaker->category,
                ]),
        ]);
    }
}
