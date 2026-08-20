<?php

namespace App\Console\Commands;

use App\Enums\RaffleDrawStatus;
use App\Models\Nominee;
use App\Models\PaymentAttempt;
use App\Models\RaffleDraw;
use App\Models\VoteOrder;
use App\Models\Voter;
use App\Services\Payments\GatewayResult;
use App\Services\Payments\PaymentConfirmationService;
use App\Services\Pricing\PricingService;
use App\Services\Settings\SettingsService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class SetupDemoData extends Command
{
    /**
     * @var string
     */
    protected $signature = 'ace:demo {--votes=25 : Confirmed demo vote orders to create}';

    /**
     * @var string
     */
    protected $description = 'Enable local end-to-end testing: seed catalog, open the voting window and raffle draw, and create confirmed demo votes through the real payment finalizer';

    public function handle(
        SettingsService $settings,
        PricingService $pricing,
        PaymentConfirmationService $confirmation,
    ): int {
        if (app()->isProduction()) {
            $this->error('ace:demo is a local/dev tool and cannot run in production.');

            return self::FAILURE;
        }

        // 1. Catalog + admin user
        $this->call('db:seed', ['--force' => true]);

        // 2. Open the voting window
        $settings->set('voting.opens_at', now()->subDay()->toIso8601String());
        $settings->set('voting.closes_at', now()->addWeeks(4)->toIso8601String());
        $settings->set('payments.paused', false);
        $settings->set('raffle.enabled', true);
        $this->info('Voting window: open (closes in 4 weeks).');

        // 3. Make sure this week's raffle draw exists and is OPEN
        $this->callSilently('raffle:scaffold-week');
        $draw = RaffleDraw::query()->latest('opens_at')->first();

        if ($draw !== null && $draw->status === RaffleDrawStatus::Scheduled) {
            $draw->update([
                'status' => RaffleDrawStatus::Open,
                'opens_at' => now()->subDay(),
                'closes_at' => now()->addDays(4),
                'draw_at' => now()->addDays(4)->addHours(2),
            ]);
        }
        $this->info("Raffle draw {$draw?->week_key}: ".($draw?->fresh()->status->value ?? 'n/a'));

        // 4. Demo voters + confirmed votes through the REAL finalizer, so
        //    ledger, counters, leaderboard and raffle entries stay consistent.
        $nominees = Nominee::query()->active()->get();
        $quantities = [1, 2, 3, 5, 10, 25, 50];
        $created = 0;

        for ($i = 0; $i < (int) $this->option('votes'); $i++) {
            $voter = Voter::factory()->withVerifiedPhone()->create([
                'display_name' => fake()->name(),
            ]);

            $quote = $pricing->quote($quantities[array_rand($quantities)]);
            $nominee = $nominees->random();

            $order = VoteOrder::query()->create([
                'voter_id' => $voter->id,
                'nominee_id' => $nominee->id,
                'vote_qty' => $quote->voteQty,
                'unit_price_minor' => $quote->unitPriceMinor,
                'amount_minor' => $quote->amountMinor,
                'currency' => $quote->currency,
                'pricing_version' => $quote->pricingVersion,
                'status' => 'PAYMENT_PENDING',
            ]);

            $attempt = PaymentAttempt::query()->create([
                'vote_order_id' => $order->id,
                'gateway' => 'fake',
                'gateway_reference' => 'demo-'.strtolower((string) Str::ulid()),
                'status' => 'PENDING',
                'amount_minor' => $order->amount_minor,
            ]);

            $confirmation->confirmFromGatewayResult(new GatewayResult(
                gatewayReference: $attempt->gateway_reference,
                status: 'success',
                raw: ['demo' => true],
                amountMinor: $attempt->amount_minor,
            ));

            $created++;
        }

        $this->info("Created {$created} confirmed demo vote orders (ledger + counters + raffle entries).");

        $this->newLine();
        $this->line('<options=bold>Ready to test:</>');
        $this->line('  Voter site:  '.url('/en'));
        $this->line('  Admin panel: '.url('/admin').'  (admin@example.com / password)');
        $this->line('  Phone OTP codes appear in storage/logs/laravel.log (run: php artisan pail)');
        $this->line('  Complete a pending payment with: php artisan ace:simulate-payment');

        return self::SUCCESS;
    }
}
