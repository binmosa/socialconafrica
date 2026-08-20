<?php

namespace App\Services\Identity;

use App\Models\AuthIdentity;
use App\Models\Voter;
use Illuminate\Support\Facades\DB;

class VoterRegistrar
{
    /**
     * Resolve a social/phone identity to a voter account.
     *
     * Never silently duplicates: when the provider supplies a phone that is
     * already verified on another voter, an account-linking resolution is
     * returned instead of a new account.
     *
     * @param  array<string, mixed>  $profile  keys: display_name, email?, phone?, metadata?
     */
    public function resolveFromProvider(string $provider, string $subject, array $profile): VoterResolution
    {
        $identity = AuthIdentity::query()
            ->where('provider', $provider)
            ->where('provider_subject_id', $subject)
            ->first();

        if ($identity !== null) {
            $voter = $identity->voter;
            $voter->update(['last_login_at' => now()]);

            return VoterResolution::authenticated($voter);
        }

        $phone = isset($profile['phone']) && is_string($profile['phone']) && $profile['phone'] !== ''
            ? PhoneNumber::normalize($profile['phone'])
            : null;

        if ($phone !== null) {
            $existing = Voter::query()->where('phone', $phone)->first();

            if ($existing !== null) {
                return VoterResolution::linkRequired($provider, $subject, [...$profile, 'phone' => $phone]);
            }
        }

        $voter = DB::transaction(function () use ($provider, $subject, $profile, $phone): Voter {
            $voter = Voter::query()->create([
                'display_name' => (string) ($profile['display_name'] ?? 'ACE Voter'),
                'email' => $profile['email'] ?? null,
                'phone' => $phone,
                'phone_verified_at' => $phone !== null ? now() : null,
                'locale' => app()->getLocale(),
                'last_login_at' => now(),
            ]);

            $this->attachIdentity($voter, $provider, $subject, $profile);

            return $voter;
        });

        return VoterResolution::authenticated($voter);
    }

    /**
     * @param  array<string, mixed>  $profile
     */
    public function attachIdentity(Voter $voter, string $provider, string $subject, array $profile = []): AuthIdentity
    {
        return $voter->authIdentities()->create([
            'provider' => $provider,
            'provider_subject_id' => $subject,
            'provider_metadata' => $profile['metadata'] ?? null,
            'linked_at' => now(),
        ]);
    }
}
