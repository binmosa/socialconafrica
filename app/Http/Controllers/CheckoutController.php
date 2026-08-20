<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Nominee;
use App\Models\Voter;
use App\Services\Payments\OrderService;
use App\Services\Pricing\PriceQuote;
use App\Services\Pricing\PricingService;
use App\Services\Settings\SettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly PricingService $pricing,
        private readonly OrderService $orders,
        private readonly SettingsService $settings,
    ) {}

    public function create(Request $request, string $locale, Nominee $nominee): Response|RedirectResponse
    {
        abort_unless($nominee->status === 'ACTIVE', 404);

        if (! $this->settings->votingWindow()->isOpen()) {
            return redirect()
                ->route('nominees.show', ['locale' => $locale, 'nominee' => $nominee->share_slug])
                ->with('error', __('Voting is not open right now.'));
        }

        return Inertia::render('checkout/select', [
            'nominee' => [
                'display_name' => $nominee->display_name,
                'handle' => $nominee->handle,
                'share_slug' => $nominee->share_slug,
                'image_path' => $nominee->image_path,
            ],
            'presets' => collect($this->pricing->presets())
                ->map(fn (PriceQuote $quote): array => $quote->toArray()),
            'unitPriceMinor' => $this->pricing->unitPriceMinor(),
            'initialQty' => max(1, (int) $request->query('qty', '1')),
            'paymentsPaused' => $this->settings->paymentsPaused(),
        ]);
    }

    public function store(Request $request, string $locale, Nominee $nominee): SymfonyResponse
    {
        abort_unless($nominee->status === 'ACTIVE', 404);

        $validated = $request->validate([
            'qty' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'amount_etb' => ['nullable', 'integer', 'min:1'],
        ]);

        try {
            $quote = isset($validated['qty'])
                ? $this->pricing->quote((int) $validated['qty'])
                : $this->pricing->resolveCustomAmount(((int) ($validated['amount_etb'] ?? 0)) * 100);
        } catch (InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['amount_etb' => $exception->getMessage()]);
        }

        /** @var Voter $voter */
        $voter = $request->user('voter');

        $category = $request->filled('category')
            ? Category::query()->where('slug', $request->string('category')->toString())->first()
            : null;

        $meta = collect($request->only(['utm_source', 'utm_medium', 'utm_campaign', 'ref']))
            ->filter()
            ->all();

        try {
            $order = $this->orders->createOrder($voter, $nominee, $quote, $category, $meta);

            $redirect = $this->orders->startPayment(
                $order,
                route('orders.return', ['locale' => $locale, 'order' => $order->reference]),
            );
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        // External gateway handoff — full page visit, not an Inertia response.
        return Inertia::location($redirect->url);
    }
}
