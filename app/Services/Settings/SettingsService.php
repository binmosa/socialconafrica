<?php

namespace App\Services\Settings;

use App\Models\Setting;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;

class SettingsService
{
    private const CACHE_PREFIX = 'ace-setting:';

    public function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever(self::CACHE_PREFIX.$key, function () use ($key, $default) {
            $setting = Setting::query()->where('key', $key)->first();

            if ($setting === null) {
                return $default;
            }

            return $setting->value ?? $default;
        });
    }

    public function set(string $key, mixed $value, ?int $updatedBy = null): void
    {
        Setting::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'updated_by' => $updatedBy],
        );

        Cache::forget(self::CACHE_PREFIX.$key);
    }

    public function votingWindow(): VotingWindow
    {
        $opensAt = $this->get('voting.opens_at');
        $closesAt = $this->get('voting.closes_at');

        return new VotingWindow(
            $opensAt !== null ? CarbonImmutable::parse($opensAt) : null,
            $closesAt !== null ? CarbonImmutable::parse($closesAt) : null,
        );
    }

    public function raffleEnabled(): bool
    {
        return (bool) $this->get('raffle.enabled', true);
    }

    public function paymentsPaused(): bool
    {
        return (bool) $this->get('payments.paused', false);
    }

    public function tieBreakRule(): string
    {
        return (string) $this->get('leaderboard.tie_break_rule', 'earliest_total');
    }

    public function raffleDefaultCutoffTime(): string
    {
        return (string) $this->get('raffle.default_cutoff_time', '18:00');
    }

    public function raffleDefaultDrawTime(): string
    {
        return (string) $this->get('raffle.default_draw_time', '20:00');
    }

    /**
     * Default weekly prize configuration, admin-overridable per draw.
     *
     * @return array<int, array{tier: string, label: string, count: int}>
     */
    public function raffleDefaultPrizeConfig(): array
    {
        return $this->get('raffle.default_prize_config', [
            ['tier' => 'PHONE', 'label' => 'Smartphone', 'count' => 7],
            ['tier' => 'GRAND', 'label' => 'Premium Smartphone', 'count' => 1],
        ]);
    }
}
