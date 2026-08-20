<?php

namespace App\Enums;

enum RaffleDrawStatus: string
{
    case Scheduled = 'SCHEDULED';
    case Open = 'OPEN';
    case Closed = 'CLOSED';
    case Drawn = 'DRAWN';
    case Published = 'PUBLISHED';
    case Cancelled = 'CANCELLED';

    /**
     * @return array<int, self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Scheduled => [self::Open, self::Cancelled],
            self::Open => [self::Closed, self::Cancelled],
            self::Closed => [self::Drawn, self::Cancelled],
            self::Drawn => [self::Published],
            self::Published, self::Cancelled => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }
}
