<?php

namespace App\Services\Leaderboard;

/**
 * Public leaderboards show approximate totals ("12.4K+"); exact totals
 * are admin-only.
 */
class ApproximateFormatter
{
    public function format(int $votes): string
    {
        if ($votes <= 0) {
            return '0';
        }

        if ($votes < 100) {
            return (string) $votes;
        }

        if ($votes < 1_000) {
            return (intdiv($votes, 10) * 10).'+';
        }

        if ($votes < 1_000_000) {
            return $this->trimmed($votes / 1_000).'K+';
        }

        return $this->trimmed($votes / 1_000_000).'M+';
    }

    private function trimmed(float $value): string
    {
        $rounded = floor($value * 10) / 10;

        return rtrim(rtrim(number_format($rounded, 1), '0'), '.');
    }
}
