<?php

namespace App\Enums;

enum PaymentAttemptStatus: string
{
    case Initiated = 'INITIATED';
    case Pending = 'PENDING';
    case Succeeded = 'SUCCEEDED';
    case Failed = 'FAILED';
    case Unknown = 'UNKNOWN';
    case Expired = 'EXPIRED';

    /**
     * @return array<int, self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Initiated => [self::Pending, self::Failed, self::Expired],
            self::Pending => [self::Succeeded, self::Failed, self::Unknown, self::Expired],
            self::Unknown => [self::Succeeded, self::Failed, self::Expired],
            self::Succeeded, self::Failed, self::Expired => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }

    public function isTerminal(): bool
    {
        return match ($this) {
            self::Succeeded, self::Failed, self::Expired => true,
            default => false,
        };
    }
}
