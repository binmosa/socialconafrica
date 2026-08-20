<?php

namespace App\Services\Raffle;

use App\Models\Voter;
use App\Services\Identity\PhoneNumber;

/**
 * Public winner display shows a shortened name plus masked contact only,
 * e.g. "Hana M. - 09*****123".
 */
class WinnerMasker
{
    public function mask(Voter $voter): string
    {
        $name = $this->maskName($voter->display_name);

        if ($voter->phone !== null) {
            return $name.' - '.PhoneNumber::mask($voter->phone);
        }

        if ($voter->email !== null) {
            return $name.' - '.$this->maskEmail($voter->email);
        }

        return $name;
    }

    private function maskName(string $displayName): string
    {
        $parts = preg_split('/\s+/u', trim($displayName)) ?: [];

        if ($parts === [] || $parts[0] === '') {
            return 'ACE Voter';
        }

        $first = $parts[0];
        $lastInitial = count($parts) > 1 ? mb_substr($parts[count($parts) - 1], 0, 1).'.' : '';

        return trim($first.' '.$lastInitial);
    }

    private function maskEmail(string $email): string
    {
        [$local, $domain] = explode('@', $email, 2) + [1 => ''];

        return mb_substr($local, 0, 2).'*****@'.$domain;
    }
}
