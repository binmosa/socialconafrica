<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Nominee;
use App\Models\NomineeVoteCounter;
use App\Services\Leaderboard\ApproximateFormatter;
use App\Services\Leaderboard\LeaderboardService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private readonly LeaderboardService $leaderboard,
        private readonly ApproximateFormatter $formatter,
    ) {}

    public function index(): Response
    {
        $locale = app()->getLocale();

        $categories = Category::query()
            ->where('status', 'ACTIVE')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->getTranslation('name', $locale),
                'slug' => $category->slug,
                'image_path' => $category->image_path,
            ]);

        $topRows = $this->leaderboard->overall()->take(8);

        $nominees = Nominee::query()
            ->with('categories')
            ->findMany($topRows->pluck('nominee_id'))
            ->keyBy('id');

        $featuredNominees = $topRows
            ->map(function (array $row) use ($nominees, $locale): ?array {
                $nominee = $nominees->get($row['nominee_id']);

                if ($nominee === null) {
                    return null;
                }

                return $this->nomineeCard($nominee, $locale) + [
                    'rank' => $row['rank'],
                    'approx_votes' => $this->formatter->format($row['total_votes']),
                ];
            })
            ->filter()
            ->values();

        return Inertia::render('home', [
            'categories' => $categories,
            'featuredNominees' => $featuredNominees,
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
