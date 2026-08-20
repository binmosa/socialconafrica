<?php

use App\Jobs\ReconcilePendingPayments;
use App\Jobs\RefreshNomineeSocialData;
use App\Jobs\TransitionRaffleDraws;
use App\Jobs\VerifyVoteCounters;
use Illuminate\Support\Facades\Schedule;

Schedule::job(TransitionRaffleDraws::class)->everyMinute();

Schedule::job(ReconcilePendingPayments::class)->everyFiveMinutes();

Schedule::job(VerifyVoteCounters::class)->dailyAt('03:00');

Schedule::job(new RefreshNomineeSocialData)->dailyAt('04:00');

Schedule::command('raffle:scaffold-week')
    ->weeklyOn(1, '00:05')
    ->timezone(config('ace.timezone'));

Schedule::command('model:prune')->daily();
