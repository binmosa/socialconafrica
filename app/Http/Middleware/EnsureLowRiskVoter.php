<?php

namespace App\Http\Middleware;

use App\Enums\VoterRiskStatus;
use App\Models\Voter;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Risk gate on payment initiation. BLOCKED voters cannot pay at all;
 * STEP_UP_REQUIRED voters are held back with a support message until an
 * admin clears the flag (full OTP step-up UX lands with the admin module).
 */
class EnsureLowRiskVoter
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Voter|null $voter */
        $voter = $request->user('voter');

        if ($voter?->risk_status === VoterRiskStatus::Blocked) {
            abort(403, __('This account cannot vote at the moment.'));
        }

        if ($voter?->risk_status === VoterRiskStatus::StepUpRequired) {
            return back()->with('error', __('Additional verification is required before voting. Please contact support.'));
        }

        return $next($request);
    }
}
