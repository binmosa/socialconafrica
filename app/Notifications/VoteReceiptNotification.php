<?php

namespace App\Notifications;

use App\Models\VoteOrder;
use App\Models\Voter;
use App\Notifications\Channels\SmsChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Receipt for a confirmed vote, sent through whichever channels the
 * voter's profile supports (SMS when a verified phone exists, email
 * when an address is known).
 */
class VoteReceiptNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly VoteOrder $order) {}

    /**
     * @return array<int, string>
     */
    public function via(Voter $notifiable): array
    {
        $channels = [];

        if ($notifiable->hasVerifiedPhone()) {
            $channels[] = SmsChannel::class;
        }

        if ($notifiable->email !== null) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toSms(Voter $notifiable): string
    {
        return __('ACE Awards: :count votes for :name confirmed (:amount ETB). Ref :ref. You have 1 entry in this week\'s draw.', [
            'count' => $this->order->vote_qty,
            'name' => $this->order->nominee->display_name,
            'amount' => number_format($this->order->amount_minor / 100, 2),
            'ref' => $this->order->reference,
        ]);
    }

    public function toMail(Voter $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(__('Your ACE Awards vote is confirmed'))
            ->line(__(':count votes for :name have been counted.', [
                'count' => $this->order->vote_qty,
                'name' => $this->order->nominee->display_name,
            ]))
            ->line(__('Amount: :amount ETB · Reference: :ref', [
                'amount' => number_format($this->order->amount_minor / 100, 2),
                'ref' => $this->order->reference,
            ]))
            ->line(__('Every successful transaction is one entry in the weekly ACE Draw. Good luck!'));
    }
}
