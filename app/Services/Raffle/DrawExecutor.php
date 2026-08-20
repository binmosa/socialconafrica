<?php

namespace App\Services\Raffle;

use App\Enums\RaffleDrawStatus;
use App\Enums\RaffleEntryStatus;
use App\Enums\RaffleWinnerStatus;
use App\Models\RaffleDraw;
use App\Models\RaffleEntry;
use App\Models\RaffleWinner;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Executes a weekly draw with an auditable, reproducible selection:
 * eligible entries are ordered by HMAC-SHA256(entry id, seed) — given the
 * persisted seed and the entry set, the winner order can be replayed
 * exactly. Winners are persisted BEFORE publication.
 */
class DrawExecutor
{
    public const METHOD = 'hmac-sha256-order-v1';

    public function execute(RaffleDraw $draw, User $admin, ?string $seed = null): RaffleDraw
    {
        return DB::transaction(function () use ($draw, $admin, $seed): RaffleDraw {
            /** @var RaffleDraw $locked */
            $locked = RaffleDraw::query()->whereKey($draw->id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== RaffleDrawStatus::Closed) {
                throw new RuntimeException('Only a CLOSED draw can be executed.');
            }

            $seed ??= bin2hex(random_bytes(16));

            $entries = RaffleEntry::query()
                ->where('raffle_draw_id', $locked->id)
                ->where('status', RaffleEntryStatus::Eligible)
                ->with('voter:id,display_name,phone,email')
                ->get();

            $ordered = $entries->sortBy(
                fn (RaffleEntry $entry): string => hash_hmac('sha256', (string) $entry->id, $seed),
            )->values();

            $winners = $this->selectDistinctWinners($ordered, $locked->prize_config);

            foreach ($winners as $winner) {
                RaffleWinner::query()->create([
                    'raffle_draw_id' => $locked->id,
                    'raffle_entry_id' => $winner['entry']->id,
                    'voter_id' => $winner['entry']->voter_id,
                    'prize_tier' => $winner['tier'],
                    'prize_label' => $winner['label'],
                    'selected_at' => now(),
                    'status' => RaffleWinnerStatus::Selected,
                ]);
            }

            $locked->update([
                'status' => RaffleDrawStatus::Drawn,
                'audit_metadata' => [
                    'seed' => $seed,
                    'method' => self::METHOD,
                    'entry_count' => $entries->count(),
                    'winner_count' => count($winners),
                    'executed_by' => $admin->id,
                    'executed_at' => now()->toIso8601String(),
                ],
            ]);

            return $locked;
        });
    }

    public function publish(RaffleDraw $draw, User $admin): RaffleDraw
    {
        return DB::transaction(function () use ($draw): RaffleDraw {
            /** @var RaffleDraw $locked */
            $locked = RaffleDraw::query()->whereKey($draw->id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== RaffleDrawStatus::Drawn) {
                throw new RuntimeException('Only a DRAWN draw can be published.');
            }

            $locked->winners()
                ->where('status', RaffleWinnerStatus::Selected)
                ->update(['status' => RaffleWinnerStatus::Published, 'published_at' => now()]);

            $locked->update([
                'status' => RaffleDrawStatus::Published,
                'published_at' => now(),
            ]);

            return $locked;
        });
    }

    /**
     * One prize per account/phone per draw: an already-selected voter (or
     * a voter sharing a selected verified phone) is skipped.
     *
     * @param  Collection<int, RaffleEntry>  $ordered
     * @param  array<int, array<string, mixed>>  $prizeConfig
     * @return array<int, array{entry: RaffleEntry, tier: string, label: string}>
     */
    private function selectDistinctWinners(Collection $ordered, array $prizeConfig): array
    {
        $slots = [];
        foreach ($prizeConfig as $prize) {
            for ($i = 0; $i < (int) $prize['count']; $i++) {
                $slots[] = ['tier' => (string) $prize['tier'], 'label' => (string) $prize['label']];
            }
        }

        $winners = [];
        $usedVoters = [];
        $usedPhones = [];

        foreach ($ordered as $entry) {
            if (count($winners) >= count($slots)) {
                break;
            }

            $phone = $entry->voter->phone;

            if (isset($usedVoters[$entry->voter_id]) || ($phone !== null && isset($usedPhones[$phone]))) {
                continue;
            }

            $slot = $slots[count($winners)];
            $winners[] = ['entry' => $entry, 'tier' => $slot['tier'], 'label' => $slot['label']];

            $usedVoters[$entry->voter_id] = true;
            if ($phone !== null) {
                $usedPhones[$phone] = true;
            }
        }

        return $winners;
    }
}
