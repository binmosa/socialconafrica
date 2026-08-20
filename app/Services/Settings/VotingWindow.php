<?php

namespace App\Services\Settings;

use Carbon\CarbonImmutable;

readonly class VotingWindow
{
    public function __construct(
        public ?CarbonImmutable $opensAt,
        public ?CarbonImmutable $closesAt,
    ) {}

    public function isOpen(): bool
    {
        if ($this->opensAt === null || $this->closesAt === null) {
            return false;
        }

        return now()->between($this->opensAt, $this->closesAt);
    }

    public function hasClosed(): bool
    {
        return $this->closesAt !== null && now()->isAfter($this->closesAt);
    }

    /**
     * @return array{opens_at: string|null, closes_at: string|null, is_open: bool}
     */
    public function toArray(): array
    {
        return [
            'opens_at' => $this->opensAt?->toIso8601String(),
            'closes_at' => $this->closesAt?->toIso8601String(),
            'is_open' => $this->isOpen(),
        ];
    }
}
