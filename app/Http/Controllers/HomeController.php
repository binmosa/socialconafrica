<?php

namespace App\Http\Controllers;

use App\Models\AttendPersona;
use App\Models\LeaderMessage;
use App\Models\Speaker;
use App\Models\Sponsor;
use App\Models\Testimonial;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $locale = app()->getLocale();

        return Inertia::render('site/home', [
            'meta' => [
                'title' => __('site.meta.title'),
                'description' => __('site.meta.description'),
            ],
            'eventDate' => config('site.event.starts_at'),
            'speakers' => Speaker::where('is_featured', true)
                ->orderBy('sort_order')
                ->get()
                ->map(fn (Speaker $speaker): array => [
                    'name' => $speaker->name,
                    'role' => $speaker->getTranslation('role', $locale),
                    'photo' => $speaker->photo_path,
                    'category' => $speaker->category,
                ]),
            'leaders' => LeaderMessage::orderBy('sort_order')
                ->get()
                ->map(fn (LeaderMessage $leader): array => [
                    'name' => $leader->name,
                    'title' => $leader->getTranslation('title', $locale),
                    'quote' => $leader->getTranslation('quote', $locale),
                    'photo' => $leader->photo_path,
                ]),
            'personas' => AttendPersona::orderBy('sort_order')
                ->get()
                ->map(fn (AttendPersona $persona): array => [
                    'title' => $persona->getTranslation('title', $locale),
                    'description' => $persona->getTranslation('description', $locale),
                    'icon' => $persona->icon,
                ]),
            'testimonials' => Testimonial::orderBy('sort_order')
                ->get()
                ->map(fn (Testimonial $testimonial): array => [
                    'author' => $testimonial->author_name,
                    'role' => $testimonial->getTranslation('role', $locale),
                    'country' => $testimonial->getTranslation('country', $locale),
                    'quote' => $testimonial->getTranslation('quote', $locale),
                ]),
            'sponsors' => Sponsor::with('tier')
                ->orderBy('sort_order')
                ->get()
                ->map(fn (Sponsor $sponsor): array => [
                    'name' => $sponsor->name,
                    'tier' => [
                        'slug' => $sponsor->tier->slug,
                        'name' => $sponsor->tier->getTranslation('name', $locale),
                    ],
                    'description' => $sponsor->getTranslation('description', $locale),
                    'url' => $sponsor->url,
                    'logo' => $sponsor->logo_path,
                ]),
        ]);
    }
}
