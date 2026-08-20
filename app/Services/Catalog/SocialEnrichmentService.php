<?php

namespace App\Services\Catalog;

use App\Models\Nominee;

/**
 * Optional presentation enrichment from social APIs. The ACE database
 * remains the source of truth: enrichment is cached, admin-overridable
 * per field (metadata.overrides), and NEVER blocks voting — failures
 * simply leave the stored nominee record untouched.
 */
class SocialEnrichmentService
{
    /**
     * Refresh cached social metadata for one nominee. The default driver
     * is a no-op; a platform-specific driver can be added once an
     * approved API/permission is available.
     */
    public function refresh(Nominee $nominee): void
    {
        if ($nominee->social_profile_url === null) {
            return;
        }

        // No approved social API is configured yet. When one is, fetch
        // follower count / avatar here and merge under metadata.social,
        // respecting metadata.overrides set by admins.
        $nominee->update(['enriched_at' => now()]);
    }

    /**
     * Effective value for a displayed field, honoring admin overrides
     * first, then enriched data, then the stored column.
     */
    public function displayValue(Nominee $nominee, string $field): mixed
    {
        return $nominee->metadata['overrides'][$field]
            ?? $nominee->metadata['social'][$field]
            ?? $nominee->getAttribute($field);
    }
}
