<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Services\Leaderboard\LeaderboardService;
use App\Services\Leaderboard\PublicBoardPresenter;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardController extends Controller
{
    public function __construct(
        private readonly LeaderboardService $leaderboard,
        private readonly PublicBoardPresenter $presenter,
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
            'standings' => $this->presenter->present($board, withProfile: true),
        ]);
    }
}
