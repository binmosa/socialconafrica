<?php

namespace App\Services\Analytics;

use App\Models\AnalyticsEvent;

class AnalyticsRecorder
{
    /**
     * Funnel events accepted from the client beacon (spec §17).
     */
    public const CLIENT_EVENTS = [
        'home_view', 'search_used', 'category_opened', 'nominee_opened',
        'vote_clicked', 'package_selected', 'custom_amount_entered',
        'login_method_selected', 'share_clicked', 'vote_again_clicked',
        'leaderboard_viewed',
    ];

    /**
     * @param  array<string, mixed>  $properties
     */
    public function record(
        string $eventName,
        ?int $voterId = null,
        ?int $nomineeId = null,
        array $properties = [],
        ?string $sessionHash = null,
    ): void {
        AnalyticsEvent::query()->create([
            'event_name' => $eventName,
            'voter_id' => $voterId,
            'nominee_id' => $nomineeId,
            'properties' => $properties === [] ? null : $properties,
            'session_hash' => $sessionHash,
        ]);
    }
}
