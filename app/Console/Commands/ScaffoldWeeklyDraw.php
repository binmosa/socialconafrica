<?php

namespace App\Console\Commands;

use App\Enums\RaffleDrawStatus;
use App\Models\RaffleDraw;
use App\Services\Settings\SettingsService;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;

class ScaffoldWeeklyDraw extends Command
{
    /**
     * @var string
     */
    protected $signature = 'raffle:scaffold-week {--week= : ISO week key, e.g. 2026-W34 (defaults to the current business week)}';

    /**
     * @var string
     */
    protected $description = 'Create the weekly raffle draw (Mon open, Fri cutoff/draw) from settings defaults; admins can edit it before it opens';

    public function handle(SettingsService $settings): int
    {
        $timezone = (string) config('ace.timezone');

        $monday = $this->option('week') !== null
            ? CarbonImmutable::parse($this->option('week'), $timezone)->startOfWeek()
            : CarbonImmutable::now($timezone)->startOfWeek();

        $weekKey = $monday->format('o-\WW');

        if (RaffleDraw::query()->where('week_key', $weekKey)->exists()) {
            $this->info("Draw {$weekKey} already exists — nothing to do.");

            return self::SUCCESS;
        }

        [$cutoffHour, $cutoffMinute] = explode(':', $settings->raffleDefaultCutoffTime()) + [1 => '0'];
        [$drawHour, $drawMinute] = explode(':', $settings->raffleDefaultDrawTime()) + [1 => '0'];

        $friday = $monday->addDays(4);

        $draw = RaffleDraw::query()->create([
            'week_key' => $weekKey,
            'opens_at' => $monday->startOfDay()->utc(),
            'closes_at' => $friday->setTime((int) $cutoffHour, (int) $cutoffMinute)->utc(),
            'draw_at' => $friday->setTime((int) $drawHour, (int) $drawMinute)->utc(),
            'status' => RaffleDrawStatus::Scheduled,
            'prize_config' => $settings->raffleDefaultPrizeConfig(),
        ]);

        $this->info("Created draw {$draw->week_key}: opens {$draw->opens_at}, cutoff {$draw->closes_at} (UTC).");

        return self::SUCCESS;
    }
}
