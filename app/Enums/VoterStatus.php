<?php

namespace App\Enums;

enum VoterStatus: string
{
    case Active = 'ACTIVE';
    case Suspended = 'SUSPENDED';
    case Merged = 'MERGED';
}
