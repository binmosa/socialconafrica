<?php

namespace App\Services\Voting;

use App\Models\NomineeVoteCounter;
use App\Models\VoteLedgerEntry;
use Illuminate\Support\Facades\DB;

/**
 * Rebuilds the counter projection from the append-only ledger — the
 * recovery hatch for any counter drift during live voting.
 */
class CounterRebuilder
{
    /**
     * @return array<string, mixed> summary of the rebuild
     */
    public function rebuild(): array
    {
        return DB::transaction(function (): array {
            $totals = VoteLedgerEntry::query()
                ->selectRaw('nominee_id, category_id, SUM(vote_delta) as total, MAX(created_at) as reached_at')
                ->groupBy('nominee_id', 'category_id')
                ->get();

            NomineeVoteCounter::query()->delete();

            foreach ($totals as $row) {
                NomineeVoteCounter::query()->create([
                    'nominee_id' => $row->nominee_id,
                    'category_id' => $row->category_id,
                    'total_votes' => max(0, (int) $row->getAttribute('total')),
                    'total_reached_at' => $row->getAttribute('reached_at'),
                ]);
            }

            return ['counters' => $totals->count()];
        });
    }

    /**
     * Compare counters to ledger sums without writing.
     *
     * @return array<int, array{nominee_id: int, category_id: int|null, counter: int, ledger: int}>
     */
    public function drift(): array
    {
        $ledger = VoteLedgerEntry::query()
            ->selectRaw('nominee_id, category_id, SUM(vote_delta) as total')
            ->groupBy('nominee_id', 'category_id')
            ->get()
            ->keyBy(fn ($row): string => $row->nominee_id.':'.($row->category_id ?? 'g'));

        $drift = [];

        foreach (NomineeVoteCounter::query()->get() as $counter) {
            $key = $counter->nominee_id.':'.($counter->category_id ?? 'g');
            $expected = max(0, (int) ($ledger[$key]?->getAttribute('total') ?? 0));

            if ($expected !== $counter->total_votes) {
                $drift[] = [
                    'nominee_id' => $counter->nominee_id,
                    'category_id' => $counter->category_id,
                    'counter' => $counter->total_votes,
                    'ledger' => $expected,
                ];
            }

            $ledger->forget($key);
        }

        foreach ($ledger as $row) {
            if ((int) $row->getAttribute('total') !== 0) {
                $drift[] = [
                    'nominee_id' => $row->nominee_id,
                    'category_id' => $row->category_id,
                    'counter' => 0,
                    'ledger' => max(0, (int) $row->getAttribute('total')),
                ];
            }
        }

        return $drift;
    }
}
