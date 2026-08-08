<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRegistrationRequest;
use App\Models\Attendee;
use App\Models\Order;
use App\Models\TicketTier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationController extends Controller
{
    public function create(): Response
    {
        $locale = app()->getLocale();

        $preselectedTier = request()->query('tier');
        if ($preselectedTier !== null && ! TicketTier::where('slug', $preselectedTier)->where('is_active', true)->exists()) {
            $preselectedTier = null;
        }

        return Inertia::render('site/register', [
            'meta' => ['title' => __('site.register.meta_title')],
            'preselectedTier' => $preselectedTier,
            'tiers' => TicketTier::where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->map(fn (TicketTier $tier): array => [
                    'slug' => $tier->slug,
                    'name' => $tier->getTranslation('name', $locale),
                    'subtitle' => $tier->getTranslation('subtitle', $locale),
                    'priceMinor' => $tier->price_minor,
                    'perks' => $tier->getTranslation('perks', $locale) ?: [],
                    'badge' => $tier->getTranslation('badge', $locale),
                ]),
        ]);
    }

    public function store(StoreRegistrationRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $tier = TicketTier::where('slug', $validated['ticket_tier'])->firstOrFail();

        $order = DB::transaction(function () use ($validated, $tier) {
            $attendee = Attendee::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'country' => $validated['country'],
                'organization' => $validated['organization'] ?? null,
                'locale' => app()->getLocale(),
            ]);

            $order = Order::create([
                'attendee_id' => $attendee->id,
                'ticket_tier_id' => $tier->id,
                'status' => 'pending',
                'payment_method' => $validated['payment_method'],
                'subtotal_minor' => $tier->price_minor,
                'total_minor' => $tier->price_minor,
                'currency' => $tier->currency,
            ]);

            $order->items()->create([
                'item_type' => 'ticket',
                'description' => $tier->getTranslation('name', 'en'),
                'unit_price_minor' => $tier->price_minor,
                'quantity' => 1,
                'line_total_minor' => $tier->price_minor,
            ]);

            return $order;
        });

        return back()->with([
            'success' => __('site.register.success'),
            'orderReference' => sprintf('SCA-2026-%05d', $order->id),
        ]);
    }
}
