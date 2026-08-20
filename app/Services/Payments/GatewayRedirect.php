<?php

namespace App\Services\Payments;

readonly class GatewayRedirect
{
    public function __construct(public string $url) {}
}
