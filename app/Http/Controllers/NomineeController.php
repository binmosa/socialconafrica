<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Nominee;
use App\Services\Catalog\NomineeSearchService;
use App\Services\Leaderboard\ApproximateFormatter;
use App\Services\Leaderboard\LeaderboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NomineeController extends Controller
{
    public function __construct(
        private readonly LeaderboardService $leaderboard,
        private readonly ApproximateFormatter $formatter,
    ) {}

    public function index(Request $request, NomineeSearchService $search): Response
    {
        $locale = app()->getLocale();
        $query = $request->string('q')->toString() ?: null;
        $category = $request->string('category')->toString() ?: null;

        $nominees = $search->search($query, $category)
            ->map(fn (Nominee $nominee): array => $this->nomineeProps($nominee, $locale));

        $categories = Category::query()
            ->where('status', 'ACTIVE')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Category $c): array => [
                'name' => $c->getTranslation('name', $locale),
                'slug' => $c->slug,
            ]);

        return Inertia::render('nominees/index', [
            'nominees' => $nominees,
            'categories' => $categories,
            'filters' => ['q' => $query, 'category' => $category],
        ]);
    }

    public function show(string $locale, Nominee $nominee): Response
    {
        abort_unless($nominee->status === 'ACTIVE', 404);

        $overall = $this->leaderboard->overall()->firstWhere('nominee_id', $nominee->id);

        return Inertia::render('nominees/show', [
            'nominee' => $this->nomineeProps($nominee->load('categories'), app()->getLocale()) + [
                'bio' => $nominee->getTranslation('bio', app()->getLocale()) ?: null,
                'social_profile_url' => $nominee->social_profile_url,
                'rank' => $overall['rank'] ?? null,
                'approx_votes' => $this->formatter->format((int) ($overall['total_votes'] ?? 0)),
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function nomineeProps(Nominee $nominee, string $locale): array
    {
        return [
            'id' => $nominee->id,
            'display_name' => $nominee->display_name,
            'handle' => $nominee->handle,
            'share_slug' => $nominee->share_slug,
            'image_path' => $nominee->image_path,
            'city' => $nominee->city,
            'categories' => $nominee->categories->map(fn (Category $category): array => [
                'name' => $category->getTranslation('name', $locale),
                'slug' => $category->slug,
            ])->values(),
        ];
    }
}
