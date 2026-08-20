<?php

namespace App\Enums;

enum VoteOrderStatus: string
{
    case Created = 'CREATED';
    case PaymentPending = 'PAYMENT_PENDING';
    case Success = 'SUCCESS';
    case Failed = 'FAILED';
    case Expired = 'EXPIRED';
    case Refunded = 'REFUNDED';

    /**
     * @return array<int, self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Created => [self::PaymentPending, self::Expired],
            self::PaymentPending => [self::Success, self::Failed, self::Expired],
            self::Failed => [self::PaymentPending],
            self::Success => [self::Refunded],
            self::Expired, self::Refunded => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }

    public function isTerminal(): bool
    {
        return $this === self::Expired || $this === self::Refunded;
    }
}
