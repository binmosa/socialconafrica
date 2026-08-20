<?php

namespace App\Services\Leaderboard;

use App\Models\Category;
use App\Models\Nominee;
use App\Services\Settings\SettingsService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Ranks read from the counter projection. All active nominees are listed,
 * including those with zero votes. Votes are global per nominee at launch;
 * category boards use the same nominee totals (spec §9).
 */
class LeaderboardService
{
    private const CACHE_TTL_SECONDS = 30;

    public function __construct(private readonly SettingsService $settings) {}

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function overall(): Collection
    {
        return $this->cached('overall', fn (): Collection => $this->standings(null));
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function category(Category $category): Collection
    {
        return $this->cached('category:'.$category->id, fn (): Collection => $this->standings($category));
    }

    /**
     * Rank of one nominee within a category board (or overall when null).
     */
    public function rankFor(Nominee $nominee, ?Category $category = null): ?int
    {
        $board = $category !== null ? $this->category($category) : $this->overall();

        $row = $board->firstWhere('nominee_id', $nominee->id);

        return $row !== null ? (int) $row['rank'] : null;
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function standings(?Category $category): Collection
    {
        /** @var Collection<int, array<string, mixed>> $rows */
        $rows = Nominee::query()
            ->active()
            ->when($category, fn ($q) => $q->whereHas(
                'categories',
                fn ($c) => $c->whereKey($category->id),
            ))
            ->leftJoin('nominee_vote_counters', function ($join): void {
                $join->on('nominee_vote_counters.nominee_id', '=', 'nominees.id')
                    ->whereNull('nominee_vote_counters.category_id');
            })
            ->select([
                'nominees.id',
                'nominees.display_name',
                'nominees.handle',
                'nominees.share_slug',
                'nominees.image_path',
                'nominee_vote_counters.total_votes',
                'nominee_vote_counters.total_reached_at',
            ])
            ->get()
            ->map(
                /**
                 * @return array<string, mixed>
                 */
                fn (Nominee $row): array => [
                    'nominee_id' => (int) $row->getAttribute('id'),
                    'display_name' => (string) $row->getAttribute('display_name'),
                    'handle' => (string) $row->getAttribute('handle'),
                    'share_slug' => (string) $row->getAttribute('share_slug'),
                    'image_path' => $row->getAttribute('image_path'),
                    'total_votes' => (int) ($row->getAttribute('total_votes') ?? 0),
                    'total_reached_at' => $row->getAttribute('total_reached_at'),
                ],
            )
            ->toBase();

        /** @var Collection<int, array<string, mixed>> $ranked */
        $ranked = $this->applyTieBreak($rows)
            ->values()
            ->map(
                /**
                 * @param  array<string, mixed>  $row
                 * @return array<string, mixed>
                 */
                fn (array $row, int $index): array => [...$row, 'rank' => $index + 1],
            );

        return $ranked;
    }

    /**
     * Default rule: highest total first; ties broken by earliest to reach
     * the total, then stable nominee id. Configurable via settings.
     *
     * @param  Collection<int, array<string, mixed>>  $rows
     * @return Collection<int, array<string, mixed>>
     */
    private function applyTieBreak(Collection $rows): Collection
    {
        $rule = $this->settings->tieBreakRule();

        return $rows->sort(function (array $a, array $b) use ($rule): int {
            $votes = ((int) $b['total_votes']) <=> ((int) $a['total_votes']);
            if ($votes !== 0) {
                return $votes;
            }

            if ($rule === 'earliest_total') {
                $reached = strcmp((string) ($a['total_reached_at'] ?? '9999'), (string) ($b['total_reached_at'] ?? '9999'));
                if ($reached !== 0) {
                    return $reached;
                }
            }

            return ((int) $a['nominee_id']) <=> ((int) $b['nominee_id']);
        });
    }

    /**
     * Only plain arrays are cached — never objects — so a stale or
     * foreign cache entry can't break rendering; anything unexpected is
     * discarded and recomputed.
     *
     * @param  \Closure(): Collection<int, array<string, mixed>>  $resolver
     * @return Collection<int, array<string, mixed>>
     */
    private function cached(string $key, \Closure $resolver): Collection
    {
        $version = (int) Cache::get('ace-leaderboard-version', 0);
        $cacheKey = "ace-leaderboard:{$version}:{$key}";

        $rows = Cache::get($cacheKey);

        if (! is_array($rows)) {
            $rows = $resolver()->all();
            Cache::put($cacheKey, $rows, self::CACHE_TTL_SECONDS);
        }

        /** @var Collection<int, array<string, mixed>> */
        return collect($rows);
    }
}
