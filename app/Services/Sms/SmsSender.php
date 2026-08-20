<?php

namespace App\Services\Sms;

interface SmsSender
{
    /**
     * Send an SMS to an E.164 phone number.
     */
    public function send(string $phone, string $message): void;
}
