<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Nominee;
use App\Models\NomineeVoteCounter;
use App\Services\Leaderboard\ApproximateFormatter;
use App\Services\Leaderboard\LeaderboardService;
use App\Services\Leaderboard\PublicBoardPresenter;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private readonly LeaderboardService $leaderboard,
        private readonly ApproximateFormatter $formatter,
        private readonly PublicBoardPresenter $presenter,
    ) {}

    public function index(): Response
    {
        $locale = app()->getLocale();

        $categoryModels = Category::query()
            ->where('status', 'ACTIVE')
            ->orderBy('sort_order')
            ->get();

        $categories = $categoryModels->map(fn (Category $category): array => [
            'id' => $category->id,
            'name' => $category->getTranslation('name', $locale),
            'slug' => $category->slug,
            'image_path' => $category->image_path,
        ]);

        $overall = $this->leaderboard->overall();
        $totalVotes = (int) $overall->sum('total_votes');
        $topRows = $overall->take(8);

        $nominees = Nominee::query()
            ->with('categories')
            ->findMany($topRows->pluck('nominee_id'))
            ->keyBy('id');

        $featuredNominees = $topRows
            ->map(function (array $row) use ($nominees, $locale, $totalVotes): ?array {
                $nominee = $nominees->get($row['nominee_id']);

                if ($nominee === null) {
                    return null;
                }

                return $this->nomineeCard($nominee, $locale) + [
                    'rank' => $row['rank'],
                    'approx_votes' => $this->formatter->format($row['total_votes']),
                    'share_pct' => PublicBoardPresenter::sharePct((int) $row['total_votes'], $totalVotes),
                ];
            })
            ->filter()
            ->values();

        $categoryHighlights = $categoryModels->map(function (Category $category) use ($locale): array {
            $board = $this->leaderboard->category($category);

            return [
                'slug' => $category->slug,
                'name' => $category->getTranslation('name', $locale),
                'count' => $board->count(),
                'nominees' => $this->presenter->present($board, limit: 4),
            ];
        })->values();

        return Inertia::render('home', [
            'categories' => $categories,
            'featuredNominees' => $featuredNominees,
            'standings' => $this->presenter->present($overall, limit: 5),
            'categoryHighlights' => $categoryHighlights,
            'stats' => [
                'creators' => Nominee::query()->active()->count(),
                'votes' => $this->formatter->format(
                    (int) NomineeVoteCounter::query()->sum('total_votes'),
                ),
                'categories' => $categories->count(),
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function nomineeCard(Nominee $nominee, string $locale): array
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
