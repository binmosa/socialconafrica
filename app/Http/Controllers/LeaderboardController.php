<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Services\Leaderboard\ApproximateFormatter;
use App\Services\Leaderboard\LeaderboardService;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardController extends Controller
{
    public function __construct(
        private readonly LeaderboardService $leaderboard,
        private readonly ApproximateFormatter $formatter,
    ) {}

    public function index(): Response
    {
        return $this->render(null);
    }

    public function category(string $locale, Category $category): Response
    {
        return $this->render($category);
    }

    private function render(?Category $category): Response
    {
        $locale = app()->getLocale();

        $categories = Category::query()
            ->where('status', 'ACTIVE')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Category $c): array => [
                'name' => $c->getTranslation('name', $locale),
                'slug' => $c->slug,
            ]);

        $board = $category !== null
            ? $this->leaderboard->category($category)
            : $this->leaderboard->overall();

        return Inertia::render('leaderboard/index', [
            'categories' => $categories,
            'activeCategory' => $category?->slug,
            'activeCategoryName' => $category?->getTranslation('name', $locale),
            'standings' => $this->publicStandings($board),
        ]);
    }

    /**
     * Public boards expose rank + approximate totals only — exact counts
     * stay internal (spec §9).
     *
     * @param  Collection<int, array<string, mixed>>  $board
     * @return Collection<int, array<string, mixed>>
     */
    private function publicStandings(Collection $board): Collection
    {
        $leaderVotes = (int) ($board->first()['total_votes'] ?? 0);

        /** @var Collection<int, array<string, mixed>> $standings */
        $standings = $board->map(
            /**
             * @param  array<string, mixed>  $row
             * @return array<string, mixed>
             */
            fn (array $row): array => [
                'rank' => $row['rank'],
                'display_name' => $row['display_name'],
                'handle' => $row['handle'],
                'share_slug' => $row['share_slug'],
                'image_path' => $row['image_path'],
                'approx_votes' => $this->formatter->format((int) $row['total_votes']),
                // Relative share of the leader (0-100) — powers the progress
                // bars without exposing exact totals.
                'share' => $leaderVotes > 0
                    ? (int) round(((int) $row['total_votes']) / $leaderVotes * 100)
                    : 0,
            ],
        );

        return $standings;
    }
}
