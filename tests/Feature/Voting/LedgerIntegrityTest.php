<?php

namespace Tests\Feature\Voting;

use App\Models\Nominee;
use App\Models\NomineeVoteCounter;
use App\Models\User;
use App\Models\VoteLedgerEntry;
use App\Services\Voting\CounterRebuilder;
use App\Services\Voting\VoteLedgerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use LogicException;
use Tests\TestCase;

class LedgerIntegrityTest extends TestCase
{
    use RefreshDatabase;

    public function test_ledger_entries_cannot_be_updated(): void
    {
        $entry = VoteLedgerEntry::factory()->create();

        $this->expectException(LogicException::class);

        $entry->update(['vote_delta' => 999]);
    }

    public function test_ledger_entries_cannot_be_deleted(): void
    {
        $entry = VoteLedgerEntry::factory()->create();

        $this->expectException(LogicException::class);

        $entry->delete();
    }

    public function test_admin_adjustment_requires_a_reason(): void
    {
        $nominee = Nominee::factory()->create();
        $admin = User::factory()->create();

        $this->expectException(InvalidArgumentException::class);

        app(VoteLedgerService::class)->adjust($nominee, 5, '   ', $admin);
    }

    public function test_admin_adjustment_writes_ledger_and_counter(): void
    {
        $nominee = Nominee::factory()->create();
        $admin = User::factory()->create();

        app(VoteLedgerService::class)->adjust($nominee, 7, 'Support ticket #123', $admin);

        $entry = VoteLedgerEntry::query()->sole();
        $this->assertSame(7, $entry->vote_delta);
        $this->assertSame($admin->id, $entry->actor_id);
        $this->assertSame(7, NomineeVoteCounter::query()->sole()->total_votes);
    }

    public function test_counter_rebuild_restores_ledger_truth(): void
    {
        $nominee = Nominee::factory()->create();
        $admin = User::factory()->create();

        app(VoteLedgerService::class)->adjust($nominee, 10, 'seed votes', $admin);
        app(VoteLedgerService::class)->adjust($nominee, 5, 'more votes', $admin);

        // Corrupt the projection.
        NomineeVoteCounter::query()->update(['total_votes' => 999]);
        $this->assertNotSame([], app(CounterRebuilder::class)->drift());

        app(CounterRebuilder::class)->rebuild();

        $this->assertSame(15, NomineeVoteCounter::query()->sole()->total_votes);
        $this->assertSame([], app(CounterRebuilder::class)->drift());
    }
}
