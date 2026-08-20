<?php

namespace App\Http\Middleware;

use App\Enums\RaffleDrawStatus;
use App\Models\RaffleDraw;
use App\Models\Voter;
use App\Services\Identity\PhoneNumber;
use App\Services\Settings\SettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    public function __construct(private readonly SettingsService $settings) {}

    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'voter' => fn (): ?array => $this->voterProps($request),
            ],
            'locale' => fn () => App::getLocale(),
            'availableLocales' => SetLocale::SUPPORTED,
            'translations' => fn (): array => $this->loadTranslations(App::getLocale()),
            'pricing' => ['unit_etb' => (int) (config('ace.pricing.unit_price_minor') / 100)],
            'votingWindow' => fn (): array => $this->settings->votingWindow()->toArray(),
            'activeDraw' => fn (): ?array => $this->activeDrawProps(),
            'flash' => fn (): array => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    protected function voterProps(Request $request): ?array
    {
        /** @var Voter|null $voter */
        $voter = $request->user('voter');

        if ($voter === null) {
            return null;
        }

        return [
            'id' => $voter->id,
            'display_name' => $voter->display_name,
            'has_verified_phone' => $voter->hasVerifiedPhone(),
            'phone_masked' => $voter->phone !== null
                ? PhoneNumber::mask($voter->phone)
                : null,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    protected function activeDrawProps(): ?array
    {
        return Cache::remember('ace-active-draw', 60, function (): ?array {
            $draw = RaffleDraw::query()
                ->where('status', RaffleDrawStatus::Open)
                ->orderBy('opens_at')
                ->first();

            if ($draw === null) {
                return null;
            }

            return [
                'week_key' => $draw->week_key,
                'closes_at' => $draw->closes_at->toIso8601String(),
                'prizes' => collect($draw->prize_config)
                    ->map(fn (array $prize): array => [
                        'tier' => $prize['tier'],
                        'label' => $prize['label'],
                        'count' => $prize['count'],
                    ])->all(),
            ];
        });
    }

    /**
     * @return array<string, mixed>
     */
    protected function loadTranslations(string $locale): array
    {
        $file = base_path("lang/{$locale}/site.php");
        if (! is_file($file)) {
            $file = base_path('lang/'.SetLocale::DEFAULT.'/site.php');
        }

        return ['site' => require $file];
    }
}
