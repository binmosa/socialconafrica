<?php

namespace App\Http\Controllers;

use App\Models\Sponsor;
use App\Models\SponsorTier;
use Inertia\Inertia;
use Inertia\Response;

class SponsorController extends Controller
{
    public function index(): Response
    {
        $locale = app()->getLocale();

        return Inertia::render('site/sponsors', [
            'meta' => ['title' => __('site.sponsors_page.meta_title')],
            'tiers' => SponsorTier::orderBy('sort_order')
                ->get()
                ->map(fn (SponsorTier $tier): array => [
                    'slug' => $tier->slug,
                    'name' => $tier->getTranslation('name', $locale),
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
