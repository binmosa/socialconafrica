<?php

namespace App\Http\Controllers;

use App\Services\Analytics\AnalyticsRecorder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AnalyticsController extends Controller
{
    public function store(Request $request, AnalyticsRecorder $recorder): JsonResponse
    {
        $validated = $request->validate([
            'event' => ['required', 'string', Rule::in(AnalyticsRecorder::CLIENT_EVENTS)],
            'nominee_id' => ['nullable', 'integer'],
            'properties' => ['nullable', 'array'],
            'properties.*' => ['scalar'],
        ]);

        $recorder->record(
            eventName: $validated['event'],
            voterId: $request->user('voter')?->id,
            nomineeId: $validated['nominee_id'] ?? null,
            properties: $validated['properties'] ?? [],
            sessionHash: hash('sha256', (string) $request->session()->getId()),
        );

        return response()->json(['ok' => true]);
    }
}
