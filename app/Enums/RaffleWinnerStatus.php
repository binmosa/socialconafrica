<?php

namespace App\Enums;

enum RaffleWinnerStatus: string
{
    case Selected = 'SELECTED';
    case Published = 'PUBLISHED';
    case Voided = 'VOIDED';
}
