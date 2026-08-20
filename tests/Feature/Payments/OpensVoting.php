<?php

namespace Tests\Feature\Payments;

use App\Services\Settings\SettingsService;

trait OpensVoting
{
    protected function openVotingWindow(): void
    {
        $settings = app(SettingsService::class);
        $settings->set('voting.opens_at', now()->subDay()->toIso8601String());
        $settings->set('voting.closes_at', now()->addWeek()->toIso8601String());
    }

    protected function closeVotingWindow(): void
    {
        $settings = app(SettingsService::class);
        $settings->set('voting.opens_at', now()->subWeeks(2)->toIso8601String());
        $settings->set('voting.closes_at', now()->subWeek()->toIso8601String());
    }
}
