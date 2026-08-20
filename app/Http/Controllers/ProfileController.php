<?php

namespace App\Http\Controllers;

use App\Enums\RaffleDrawStatus;
use App\Enums\RaffleEntryStatus;
use App\Models\VoteOrder;
use App\Models\Voter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function show(Request $request): Response
    {
        /** @var Voter $voter */
        $voter = $request->user('voter');

        $orders = $voter->voteOrders()
            ->with('nominee:id,display_name,share_slug')
            ->latest()
            ->limit(25)
            ->get()
            ->map(fn (VoteOrder $order): array => [
                'reference' => $order->reference,
                'nominee' => [
                    'display_name' => $order->nominee->display_name,
                    'share_slug' => $order->nominee->share_slug,
                ],
                'vote_qty' => $order->vote_qty,
                'amount_minor' => $order->amount_minor,
                'status' => $order->status->value,
                'created_at' => $order->created_at?->toIso8601String(),
            ]);

        $activeDrawEntries = $voter->raffleEntries()
            ->where('status', RaffleEntryStatus::Eligible)
            ->whereHas('draw', fn ($q) => $q->where('status', RaffleDrawStatus::Open))
            ->count();

        return Inertia::render('me', [
            'orders' => $orders,
            'activeDrawEntries' => $activeDrawEntries,
            'authProviders' => $voter->authIdentities()->pluck('provider')->unique()->values(),
        ]);
    }
}
