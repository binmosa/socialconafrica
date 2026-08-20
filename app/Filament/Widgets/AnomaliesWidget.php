<?php

namespace App\Filament\Widgets;

use App\Enums\PaymentAttemptStatus;
use App\Models\PaymentAttempt;
use App\Models\PaymentWebhookCall;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;

class AnomaliesWidget extends StatsOverviewWidget
{
    protected ?string $heading = 'Anomalies';

    protected ?string $description = 'Investigate anything non-zero.';

    protected ?string $pollingInterval = '60s';

    protected function getStats(): array
    {
        $driftReport = Cache::get('ace-counter-drift');
        $driftCount = is_array($driftReport) ? count($driftReport['drift'] ?? []) : null;

        $unknownAttempts = PaymentAttempt::query()
            ->where('status', PaymentAttemptStatus::Unknown)
            ->count();

        $invalidSignatures = PaymentWebhookCall::query()
            ->where('signature_valid', false)
            ->where('created_at', '>=', now()->subDay())
            ->count();

        return [
            Stat::make('Counter drift', $driftCount === null ? 'not checked yet' : (string) $driftCount)
                ->color($driftCount ? 'danger' : 'success')
                ->description($driftReport['checked_at'] ?? null),
            Stat::make('Attempts held UNKNOWN', (string) $unknownAttempts)
                ->color($unknownAttempts > 0 ? 'warning' : 'success')
                ->description('Amount mismatches or ambiguous gateway answers'),
            Stat::make('Invalid webhook signatures (24h)', (string) $invalidSignatures)
                ->color($invalidSignatures > 0 ? 'danger' : 'success'),
        ];
    }
}
