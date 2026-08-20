<?php

namespace App\Services\Identity;

class TelegramLoginVerifier
{
    /**
     * Verify a Telegram Login Widget payload per the official algorithm:
     * HMAC-SHA256 of the sorted data-check-string keyed by sha256(bot_token).
     *
     * @param  array<string, mixed>  $payload
     */
    public function verify(array $payload): bool
    {
        $hash = $payload['hash'] ?? null;
        $botToken = (string) config('ace.auth.telegram.bot_token');

        if (! is_string($hash) || $hash === '' || $botToken === '') {
            return false;
        }

        $authDate = (int) ($payload['auth_date'] ?? 0);
        $maxAge = (int) config('ace.auth.telegram.max_auth_age');
        if ($authDate <= 0 || (time() - $authDate) > $maxAge) {
            return false;
        }

        $data = collect($payload)
            ->except('hash')
            ->map(fn (mixed $value, string $key): string => $key.'='.$value)
            ->sort()
            ->implode("\n");

        $secretKey = hash('sha256', $botToken, true);
        $expected = hash_hmac('sha256', $data, $secretKey);

        return hash_equals($expected, $hash);
    }
}
