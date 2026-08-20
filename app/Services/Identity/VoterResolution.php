<?php

namespace App\Services\Identity;

use App\Models\Voter;

readonly class VoterResolution
{
    /**
     * @param  array{provider: string, subject: string, profile: array<string, mixed>}|null  $pendingLink
     */
    private function __construct(
        public bool $requiresLinking,
        public ?Voter $voter,
        public ?array $pendingLink,
    ) {}

    public static function authenticated(Voter $voter): self
    {
        return new self(false, $voter, null);
    }

    /**
     * @param  array<string, mixed>  $profile
     */
    public static function linkRequired(string $provider, string $subject, array $profile): self
    {
        return new self(true, null, [
            'provider' => $provider,
            'subject' => $subject,
            'profile' => $profile,
        ]);
    }
}
