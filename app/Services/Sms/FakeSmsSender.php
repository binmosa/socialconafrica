<?php

namespace App\Services\Sms;

class FakeSmsSender implements SmsSender
{
    /** @var array<int, array{phone: string, message: string}> */
    public array $sent = [];

    public function send(string $phone, string $message): void
    {
        $this->sent[] = ['phone' => $phone, 'message' => $message];
    }

    public function lastMessageFor(string $phone): ?string
    {
        foreach (array_reverse($this->sent) as $sms) {
            if ($sms['phone'] === $phone) {
                return $sms['message'];
            }
        }

        return null;
    }
}
