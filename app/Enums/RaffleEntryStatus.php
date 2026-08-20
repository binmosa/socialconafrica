<?php

namespace App\Enums;

enum RaffleEntryStatus: string
{
    case Eligible = 'ELIGIBLE';
    case Void = 'VOID';
}
