<?php

namespace Tests\Feature\Raffle;

use App\Enums\RaffleDrawStatus;
use App\Jobs\TransitionRaffleDraws;
use App\Models\RaffleDraw;
use App\Models\RaffleEntry;
use App\Models\User;
use App\Models\Voter;
use App\Services\Raffle\DrawExecutor;
use App\Services\Raffle\WinnerMasker;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class RaffleLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_transitions_open_and_close_due_draws(): void
    {
        $due = RaffleDraw::factory()->create([
            'status' => RaffleDrawStatus::Scheduled,
            'opens_at' => now()->subMinute(),
            'closes_at' => now()->addDay(),
        ]);
        $closing = RaffleDraw::factory()->create([
            'status' => RaffleDrawStatus::Open,
            'opens_at' => now()->subDays(4),
            'closes_at' => now()->subMinute(),
        ]);
        $future = RaffleDraw::factory()->create([
            'status' => RaffleDrawStatus::Scheduled,
            'opens_at' => now()->addDay(),
            'closes_at' => now()->addDays(5),
        ]);

        (new TransitionRaffleDraws)->handle();

        $this->assertSame(RaffleDrawStatus::Open, $due->fresh()->status);
        $this->assertSame(RaffleDrawStatus::Closed, $closing->fresh()->status);
        $this->assertSame(RaffleDrawStatus::Scheduled, $future->fresh()->status);
    }

    public function test_scaffold_command_creates_the_week_draw_once(): void
    {
        $this->artisan('raffle:scaffold-week')->assertSuccessful();

        $this->assertSame(1, RaffleDraw::query()->count());

        $draw = RaffleDraw::query()->sole();
        $this->assertSame(RaffleDrawStatus::Scheduled, $draw->status);
        $this->assertCount(2, $draw->prize_config);

        // Second run is a no-op.
        $this->artisan('raffle:scaffold-week')->assertSuccessful();
        $this->assertSame(1, RaffleDraw::query()->count());
    }

    public function test_winner_masking_formats(): void
    {
        $masker = new WinnerMasker;

        $withPhone = Voter::factory()->create([
            'display_name' => 'Hana Mekonnen',
            'phone' => '+251911223123',
            'phone_verified_at' => now(),
        ]);
        $this->assertSame('Hana M. - 09*****123', $masker->mask($withPhone));

        $emailOnly = Voter::factory()->create([
            'display_name' => 'Samuel',
            'phone' => null,
            'email' => 'samuel@example.com',
        ]);
        $this->assertSame('Samuel - sa*****@example.com', $masker->mask($emailOnly));
    }

    public function test_winners_page_shows_only_published_draws_with_masked_names(): void
    {
        $draw = RaffleDraw::factory()->closed()->create();
        $voter = Voter::factory()->create([
            'display_name' => 'Hana Mekonnen',
            'phone' => '+251911223123',
            'phone_verified_at' => now(),
        ]);
        RaffleEntry::factory()->create(['raffle_draw_id' => $draw->id, 'voter_id' => $voter->id]);

        $admin = User::factory()->create();
        app(DrawExecutor::class)->execute($draw, $admin);

        // Drawn but not yet published → empty winners page.
        $this->get('/en/winners')->assertInertia(fn (AssertableInertia $page) => $page->has('weeks', 0));

        app(DrawExecutor::class)->publish($draw->fresh(), $admin);

        $this->get('/en/winners')->assertInertia(fn (AssertableInertia $page) => $page
            ->has('weeks', 1)
            ->where('weeks.0.winners.0.masked_name', 'Hana M. - 09*****123')
        );
    }
}
