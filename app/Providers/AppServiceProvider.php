<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Nominee;
use App\Models\RaffleDraw;
use App\Models\RaffleWinner;
use App\Models\Setting;
use App\Models\VoteOrder;
use App\Models\Voter;
use App\Observers\AuditsAdminMutations;
use App\Services\Payments\FakeGateway;
use App\Services\Payments\PaymentGateway;
use App\Services\Payments\SantimPayGateway;
use App\Services\Sms\FakeSmsSender;
use App\Services\Sms\LogSmsSender;
use App\Services\Sms\SmsSender;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(SmsSender::class, function (): SmsSender {
            return match (config('ace.sms.driver')) {
                'fake' => new FakeSmsSender,
                default => new LogSmsSender,
            };
        });

        $this->app->singleton(PaymentGateway::class, function (): PaymentGateway {
            return match (config('ace.payments.driver')) {
                'santimpay' => new SantimPayGateway,
                default => new FakeGateway,
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerAdminAuditObserver();
    }

    /**
     * Safety-net audit trail on models admins curate through Filament.
     */
    protected function registerAdminAuditObserver(): void
    {
        foreach ([
            Category::class,
            Nominee::class,
            Voter::class,
            VoteOrder::class,
            RaffleDraw::class,
            RaffleWinner::class,
            Setting::class,
        ] as $model) {
            $model::observe(AuditsAdminMutations::class);
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
