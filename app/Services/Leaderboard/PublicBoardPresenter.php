<?php

namespace App\Services\Leaderboard;

use App\Models\Category;
use App\Models\Nominee;
use Illuminate\Support\Collection;

/**
 * Shapes leaderboard rows for public pages: rank, approximate totals, a
 * relative share of the leader (progress bars) and share of voice — never
 * exact counts (spec §9).
 */
class PublicBoardPresenter
{
    public function __construct(private readonly ApproximateFormatter $formatter) {}

    /**
     * @param  Collection<int, array<string, mixed>>  $board  Full board (used for totals)
     * @param  int|null  $limit  Rows to return (null = all)
     * @param  bool  $withProfile  Attach first category + city (one extra query)
     * @return Collection<int, array<string, mixed>>
     */
    public function present(Collection $board, ?int $limit = null, bool $withProfile = false): Collection
    {
        $leaderVotes = (int) ($board->first()['total_votes'] ?? 0);
        $totalVotes = (int) $board->sum('total_votes');
        $rows = $limit !== null ? $board->take($limit) : $board;

        $profiles = $withProfile
            ? Nominee::query()->with('categories')->findMany($rows->pluck('nominee_id'))->keyBy('id')
            : collect();

        $locale = app()->getLocale();

        /** @var Collection<int, array<string, mixed>> $public */
        $public = $rows->map(
            /**
             * @param  array<string, mixed>  $row
             * @return array<string, mixed>
             */
            function (array $row) use ($leaderVotes, $totalVotes, $profiles, $locale, $withProfile): array {
                $votes = (int) $row['total_votes'];
                /** @var Nominee|null $nominee */
                $nominee = $profiles->get($row['nominee_id']);
                /** @var Category|null $category */
                $category = $nominee?->categories->first();

                $public = [
                    'rank' => $row['rank'],
                    'display_name' => $row['display_name'],
                    'handle' => $row['handle'],
                    'share_slug' => $row['share_slug'],
                    'image_path' => $row['image_path'],
                    'approx_votes' => $this->formatter->format($votes),
                    'share' => $leaderVotes > 0 ? (int) round($votes / $leaderVotes * 100) : 0,
                    'share_pct' => self::sharePct($votes, $totalVotes),
                ];

                if ($withProfile) {
                    $public['category'] = $category?->getTranslation('name', $locale);
                    $public['city'] = $nominee?->city;
                }

                return $public;
            },
        )->values();

        return $public;
    }

    /**
     * Share of all votes cast, one decimal (0 when nothing has been cast).
     */
    public static function sharePct(int $votes, int $totalVotes): float
    {
        return $totalVotes > 0 ? round($votes / $totalVotes * 100, 1) : 0.0;
    }
}
