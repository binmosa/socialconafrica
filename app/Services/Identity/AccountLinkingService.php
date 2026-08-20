<?php

namespace App\Services\Identity;

use App\Models\Voter;

class AccountLinkingService
{
    public function __construct(private readonly VoterRegistrar $registrar) {}

    /**
     * Attach a pending provider identity to the voter that owns the phone,
     * after the person proved phone ownership via OTP.
     *
     * @param  array<string, mixed>  $pendingLink  keys: provider, subject, profile{phone, ...}
     */
    public function completeLink(array $pendingLink): Voter
    {
        $profile = (array) $pendingLink['profile'];
        $phone = (string) $profile['phone'];

        /** @var Voter $voter */
        $voter = Voter::query()->where('phone', $phone)->firstOrFail();

        $this->registrar->attachIdentity(
            $voter,
            (string) $pendingLink['provider'],
            (string) $pendingLink['subject'],
            [
                'metadata' => [
                    ...(array) ($profile['metadata'] ?? []),
                    'linked_via' => 'phone-collision-otp',
                ],
            ],
        );

        $voter->update(['last_login_at' => now()]);

        return $voter;
    }
}
