<?php

namespace App\Http\Controllers;

use App\Enums\RaffleDrawStatus;
use App\Enums\RaffleWinnerStatus;
use App\Models\RaffleDraw;
use App\Models\RaffleWinner;
use App\Services\Raffle\WinnerMasker;
use Inertia\Inertia;
use Inertia\Response;

class WinnersController extends Controller
{
    public function index(WinnerMasker $masker): Response
    {
        $weeks = RaffleDraw::query()
            ->where('status', RaffleDrawStatus::Published)
            ->with(['winners' => fn ($q) => $q->where('status', RaffleWinnerStatus::Published)->with('voter')])
            ->orderByDesc('opens_at')
            ->limit(12)
            ->get()
            ->map(fn (RaffleDraw $draw): array => [
                'week_key' => $draw->week_key,
                'winners' => $draw->winners->map(fn (RaffleWinner $winner): array => [
                    'masked_name' => $masker->mask($winner->voter),
                    'prize_label' => $winner->prize_label,
                ])->values(),
            ]);

        return Inertia::render('winners', ['weeks' => $weeks]);
    }
}
