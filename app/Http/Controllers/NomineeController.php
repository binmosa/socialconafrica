<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Nominee;
use App\Services\Catalog\NomineeSearchService;
use App\Services\Leaderboard\ApproximateFormatter;
use App\Services\Leaderboard\LeaderboardService;
use App\Services\Leaderboard\PublicBoardPresenter;
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

        $overall = $this->leaderboard->overall()->keyBy('nominee_id');
        $totalVotes = (int) $overall->sum('total_votes');

        $nominees = $search->search($query, $category)
            ->map(function (Nominee $nominee) use ($locale, $overall, $totalVotes): array {
                $row = $overall->get($nominee->id);
                $votes = (int) ($row['total_votes'] ?? 0);

                return $this->nomineeProps($nominee, $locale) + [
                    'rank' => $row['rank'] ?? null,
                    'approx_votes' => $this->formatter->format($votes),
                    'share_pct' => PublicBoardPresenter::sharePct($votes, $totalVotes),
                ];
            })
            ->sortBy(fn (array $card): int => $card['rank'] ?? PHP_INT_MAX)
            ->values();

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

        $board = $this->leaderboard->overall();
        $overall = $board->firstWhere('nominee_id', $nominee->id);
        $votes = (int) ($overall['total_votes'] ?? 0);

        return Inertia::render('nominees/show', [
            'nominee' => $this->nomineeProps($nominee->load('categories'), app()->getLocale()) + [
                'bio' => $nominee->getTranslation('bio', app()->getLocale()) ?: null,
                'social_profile_url' => $nominee->social_profile_url,
                'rank' => $overall['rank'] ?? null,
                'approx_votes' => $this->formatter->format($votes),
                'share_pct' => PublicBoardPresenter::sharePct($votes, (int) $board->sum('total_votes')),
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
