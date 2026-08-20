<?php

namespace App\Filament\Widgets;

use App\Enums\PaymentAttemptStatus;
use App\Enums\RaffleDrawStatus;
use App\Enums\VoteOrderStatus;
use App\Models\NomineeVoteCounter;
use App\Models\PaymentAttempt;
use App\Models\RaffleEntry;
use App\Models\VoteOrder;
use App\Models\Voter;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AwardsStatsOverview extends StatsOverviewWidget
{
    protected ?string $pollingInterval = '30s';

    protected function getStats(): array
    {
        $revenueMinor = (int) VoteOrder::query()
            ->where('status', VoteOrderStatus::Success)
            ->sum('amount_minor');

        $votesSold = (int) NomineeVoteCounter::query()->sum('total_votes');

        $terminalAttempts = PaymentAttempt::query()
            ->whereIn('status', [PaymentAttemptStatus::Succeeded, PaymentAttemptStatus::Failed])
            ->count();
        $succeededAttempts = PaymentAttempt::query()
            ->where('status', PaymentAttemptStatus::Succeeded)
            ->count();
        $successRate = $terminalAttempts > 0
            ? round($succeededAttempts / $terminalAttempts * 100, 1).'%'
            : '—';

        $activeDrawEntries = RaffleEntry::query()
            ->whereHas('draw', fn ($q) => $q->where('status', RaffleDrawStatus::Open))
            ->count();

        return [
            Stat::make('Revenue (ETB)', number_format($revenueMinor / 100, 2)),
            Stat::make('Votes counted', number_format($votesSold)),
            Stat::make('Successful orders', number_format(VoteOrder::query()->where('status', VoteOrderStatus::Success)->count())),
            Stat::make('Payment success rate', $successRate),
            Stat::make('Voters', number_format(Voter::query()->count())),
            Stat::make('Entries in open draw', number_format($activeDrawEntries)),
        ];
    }
}
