<?php

namespace App\Jobs;

use App\Models\Nominee;
use App\Services\Catalog\SocialEnrichmentService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class RefreshNomineeSocialData implements ShouldQueue
{
    use Queueable;

    public function handle(SocialEnrichmentService $enrichment): void
    {
        Nominee::query()
            ->active()
            ->whereNotNull('social_profile_url')
            ->each(function (Nominee $nominee) use ($enrichment): void {
                try {
                    $enrichment->refresh($nominee);
                } catch (Throwable $exception) {
                    // Enrichment must never block anything — log and move on.
                    Log::warning('Social enrichment failed', [
                        'nominee_id' => $nominee->id,
                        'error' => $exception->getMessage(),
                    ]);
                }
            });
    }
}
