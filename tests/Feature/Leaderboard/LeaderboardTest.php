<?php

namespace Tests\Feature\Leaderboard;

use App\Models\Category;
use App\Models\Nominee;
use App\Models\NomineeVoteCounter;
use App\Services\Leaderboard\ApproximateFormatter;
use App\Services\Leaderboard\LeaderboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class LeaderboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_active_nominees_are_listed_even_with_zero_votes(): void
    {
        Nominee::factory()->count(3)->create();
        Nominee::factory()->hidden()->create();

        $board = app(LeaderboardService::class)->overall();

        $this->assertCount(3, $board);
        $this->assertSame([1, 2, 3], $board->pluck('rank')->all());
    }

    public function test_ranking_sorts_by_votes_descending(): void
    {
        $low = Nominee::factory()->create();
        $high = Nominee::factory()->create();

        NomineeVoteCounter::query()->create(['nominee_id' => $low->id, 'total_votes' => 10, 'total_reached_at' => now()]);
        NomineeVoteCounter::query()->create(['nominee_id' => $high->id, 'total_votes' => 500, 'total_reached_at' => now()]);

        $board = app(LeaderboardService::class)->overall();

        $this->assertSame($high->id, $board[0]['nominee_id']);
        $this->assertSame(1, $board[0]['rank']);
        $this->assertSame($low->id, $board[1]['nominee_id']);
    }

    public function test_tie_break_prefers_earliest_to_reach_the_total(): void
    {
        $late = Nominee::factory()->create();
        $early = Nominee::factory()->create();

        NomineeVoteCounter::query()->create([
            'nominee_id' => $late->id,
            'total_votes' => 100,
            'total_reached_at' => now(),
        ]);
        NomineeVoteCounter::query()->create([
            'nominee_id' => $early->id,
            'total_votes' => 100,
            'total_reached_at' => now()->subHour(),
        ]);

        $board = app(LeaderboardService::class)->overall();

        $this->assertSame($early->id, $board[0]['nominee_id']);
        $this->assertSame($late->id, $board[1]['nominee_id']);
    }

    public function test_category_board_only_contains_category_nominees(): void
    {
        $category = Category::factory()->create();
        $inside = Nominee::factory()->create();
        $inside->categories()->attach($category);
        Nominee::factory()->create(); // outside

        $board = app(LeaderboardService::class)->category($category);

        $this->assertCount(1, $board);
        $this->assertSame($inside->id, $board[0]['nominee_id']);
    }

    public function test_approximate_formatter_matches_spec_examples(): void
    {
        $formatter = new ApproximateFormatter;

        $this->assertSame('0', $formatter->format(0));
        $this->assertSame('42', $formatter->format(42));
        $this->assertSame('130+', $formatter->format(137));
        $this->assertSame('12.4K+', $formatter->format(12_437));
        $this->assertSame('1M+', $formatter->format(1_050_000));
    }

    public function test_public_leaderboard_page_shows_approximate_totals_only(): void
    {
        $nominee = Nominee::factory()->create();
        NomineeVoteCounter::query()->create([
            'nominee_id' => $nominee->id,
            'total_votes' => 12_437,
            'total_reached_at' => now(),
        ]);

        $this->get('/en/leaderboard')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('leaderboard/index')
                ->where('standings.0.approx_votes', '12.4K+')
                ->where('standings.0.rank', 1)
                ->missing('standings.0.total_votes')
            );
    }

    public function test_category_leaderboard_page_renders(): void
    {
        $category = Category::factory()->create(['slug' => 'comedy']);
        $nominee = Nominee::factory()->create();
        $nominee->categories()->attach($category);

        $this->get('/en/leaderboard/comedy')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('activeCategory', 'comedy')
                ->has('standings', 1)
            );
    }
}
