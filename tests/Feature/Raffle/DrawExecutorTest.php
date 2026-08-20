<?php

namespace Tests\Feature\Raffle;

use App\Enums\RaffleDrawStatus;
use App\Enums\RaffleWinnerStatus;
use App\Models\RaffleDraw;
use App\Models\RaffleEntry;
use App\Models\RaffleWinner;
use App\Models\User;
use App\Models\VoteOrder;
use App\Models\Voter;
use App\Services\Raffle\DrawExecutor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class DrawExecutorTest extends TestCase
{
    use RefreshDatabase;

    private function closedDrawWithEntries(int $voters, int $entriesPerVoter = 1): RaffleDraw
    {
        $draw = RaffleDraw::factory()->closed()->create();

        Voter::factory()->count($voters)->create()->each(function (Voter $voter) use ($draw, $entriesPerVoter): void {
            RaffleEntry::factory()->count($entriesPerVoter)->create([
                'raffle_draw_id' => $draw->id,
                'voter_id' => $voter->id,
                'vote_order_id' => fn () => VoteOrder::factory()->success()->create(['voter_id' => $voter->id])->id,
            ]);
        });

        return $draw;
    }

    public function test_selects_eight_distinct_winners_and_records_audit(): void
    {
        $draw = $this->closedDrawWithEntries(voters: 20);
        $admin = User::factory()->create();

        $executed = app(DrawExecutor::class)->execute($draw, $admin);

        $this->assertSame(RaffleDrawStatus::Drawn, $executed->status);

        $winners = RaffleWinner::query()->where('raffle_draw_id', $draw->id)->get();
        $this->assertCount(8, $winners);
        $this->assertCount(8, $winners->pluck('voter_id')->unique());
        $this->assertSame(7, $winners->where('prize_tier', 'PHONE')->count());
        $this->assertSame(1, $winners->where('prize_tier', 'GRAND')->count());
        // Winners are persisted but NOT public before publication.
        $this->assertTrue($winners->every(fn (RaffleWinner $w) => $w->status === RaffleWinnerStatus::Selected));

        $audit = $executed->audit_metadata;
        $this->assertNotEmpty($audit['seed']);
        $this->assertSame(DrawExecutor::METHOD, $audit['method']);
        $this->assertSame(20, $audit['entry_count']);
        $this->assertSame($admin->id, $audit['executed_by']);
    }

    public function test_a_voter_with_many_entries_cannot_win_twice_in_one_draw(): void
    {
        $draw = $this->closedDrawWithEntries(voters: 9, entriesPerVoter: 5);
        $admin = User::factory()->create();

        app(DrawExecutor::class)->execute($draw, $admin);

        $winners = RaffleWinner::query()->where('raffle_draw_id', $draw->id)->get();
        $this->assertCount(8, $winners);
        $this->assertCount(8, $winners->pluck('voter_id')->unique());
    }

    public function test_selection_is_deterministic_given_the_same_seed(): void
    {
        $seed = str_repeat('ab', 16);
        $admin = User::factory()->create();

        $draw = $this->closedDrawWithEntries(voters: 15);
        app(DrawExecutor::class)->execute($draw, $admin, $seed);
        $first = RaffleWinner::query()->where('raffle_draw_id', $draw->id)->pluck('raffle_entry_id')->all();

        // Rebuild an identical draw (same entry ids relative order is what matters).
        RaffleWinner::query()->delete();
        RaffleDraw::query()->whereKey($draw->id)->update([
            'status' => RaffleDrawStatus::Closed->value,
            'audit_metadata' => null,
        ]);

        app(DrawExecutor::class)->execute($draw->fresh(), $admin, $seed);
        $second = RaffleWinner::query()->where('raffle_draw_id', $draw->id)->pluck('raffle_entry_id')->all();

        $this->assertSame($first, $second);
    }

    public function test_fewer_entries_than_prizes_selects_everyone_once(): void
    {
        $draw = $this->closedDrawWithEntries(voters: 3);
        $admin = User::factory()->create();

        app(DrawExecutor::class)->execute($draw, $admin);

        $this->assertSame(3, RaffleWinner::query()->where('raffle_draw_id', $draw->id)->count());
    }

    public function test_only_closed_draws_can_be_executed(): void
    {
        $draw = RaffleDraw::factory()->open()->create();

        $this->expectException(RuntimeException::class);

        app(DrawExecutor::class)->execute($draw, User::factory()->create());
    }

    public function test_publish_reveals_winners_and_finalizes_the_draw(): void
    {
        $draw = $this->closedDrawWithEntries(voters: 10);
        $admin = User::factory()->create();

        app(DrawExecutor::class)->execute($draw, $admin);
        $published = app(DrawExecutor::class)->publish($draw->fresh(), $admin);

        $this->assertSame(RaffleDrawStatus::Published, $published->status);
        $this->assertNotNull($published->published_at);
        $this->assertTrue(
            RaffleWinner::query()->where('raffle_draw_id', $draw->id)->get()
                ->every(fn (RaffleWinner $w) => $w->status === RaffleWinnerStatus::Published && $w->published_at !== null),
        );
    }
}
