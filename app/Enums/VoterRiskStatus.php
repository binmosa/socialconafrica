<?php

namespace App\Enums;

enum VoterRiskStatus: string
{
    case Normal = 'NORMAL';
    case StepUpRequired = 'STEP_UP_REQUIRED';
    case Blocked = 'BLOCKED';
}
