<?php

namespace App\Http\Controllers;

use App\Enums\RaffleDrawStatus;
use App\Enums\RaffleEntryStatus;
use App\Enums\VoteOrderStatus;
use App\Models\RaffleEntry;
use App\Models\VoteOrder;
use App\Services\Leaderboard\LeaderboardService;
use App\Services\Payments\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class PaymentController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
        private readonly LeaderboardService $leaderboard,
    ) {}

    /**
     * Browser return from the gateway. DISPLAY ONLY — status comes from
     * the server-confirmed order row; this request never mutates state.
     */
    public function show(string $locale, VoteOrder $order): Response
    {
        $order->load('nominee:id,display_name,share_slug,image_path');

        return Inertia::render('orders/status', [
            'order' => [
                'reference' => $order->reference,
                'status' => $order->status->value,
                'vote_qty' => $order->vote_qty,
                'amount_minor' => $order->amount_minor,
                'nominee' => [
                    'display_name' => $order->nominee->display_name,
                    'share_slug' => $order->nominee->share_slug,
                    'image_path' => $order->nominee->image_path,
                ],
            ],
            'rank' => $order->status === VoteOrderStatus::Success
                ? $this->leaderboard->rankFor($order->nominee)
                : null,
            'raffle' => $this->raffleProps($order),
        ]);
    }

    /**
     * Try Again after a failed payment: same order, fresh attempt.
     */
    public function retry(Request $request, string $locale, VoteOrder $order): SymfonyResponse
    {
        abort_unless($request->user('voter')?->id === $order->voter_id, 403);

        try {
            $redirect = $this->orders->startPayment(
                $order,
                route('orders.return', ['locale' => $locale, 'order' => $order->reference]),
            );
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return Inertia::location($redirect->url);
    }

    /**
     * @return array{entered: bool, total_entries: int}|null
     */
    private function raffleProps(VoteOrder $order): ?array
    {
        if ($order->status !== VoteOrderStatus::Success) {
            return null;
        }

        $entry = RaffleEntry::query()->where('vote_order_id', $order->id)->first();

        $totalEntries = RaffleEntry::query()
            ->where('voter_id', $order->voter_id)
            ->where('status', RaffleEntryStatus::Eligible)
            ->whereHas('draw', fn ($q) => $q->where('status', RaffleDrawStatus::Open))
            ->count();

        return [
            'entered' => $entry !== null && $entry->status === RaffleEntryStatus::Eligible,
            'total_entries' => $totalEntries,
        ];
    }
}
