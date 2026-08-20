<?php

namespace App\Notifications\Channels;

use App\Models\Voter;
use App\Services\Sms\SmsSender;
use Illuminate\Notifications\Notification;

class SmsChannel
{
    public function __construct(private readonly SmsSender $sms) {}

    public function send(Voter $notifiable, Notification $notification): void
    {
        if ($notifiable->phone === null || ! method_exists($notification, 'toSms')) {
            return;
        }

        $this->sms->send($notifiable->phone, $notification->toSms($notifiable));
    }
}
