<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Voter;
use App\Services\Identity\OtpService;
use App\Services\Identity\PhoneNumber;
use App\Services\Identity\PostLoginRedirector;
use App\Services\Identity\VoterRegistrar;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class PhoneOtpController extends Controller
{
    public function __construct(
        private readonly OtpService $otp,
        private readonly VoterRegistrar $registrar,
        private readonly PostLoginRedirector $redirector,
    ) {}

    /**
     * Send a login OTP to the given phone.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate(['phone' => ['required', 'string', 'max:20']]);

        $phone = $this->normalizeOrFail($validated['phone']);

        if (! $this->otp->request($phone, 'login')) {
            throw ValidationException::withMessages([
                'phone' => __('Too many codes requested. Please wait a few minutes and try again.'),
            ]);
        }

        return back()->with('otp_phone', $phone);
    }

    /**
     * Verify a login OTP; creates the voter account on first login.
     */
    public function verify(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
            'code' => ['required', 'digits:6'],
            'display_name' => ['nullable', 'string', 'max:120'],
        ]);

        $phone = $this->normalizeOrFail($validated['phone']);

        if (! $this->otp->verify($phone, $validated['code'], 'login')) {
            throw ValidationException::withMessages([
                'code' => __('That code is invalid or has expired. Request a new one.'),
            ])->errorBag('default');
        }

        $voter = Voter::query()->where('phone', $phone)->first();

        if ($voter === null) {
            $resolution = $this->registrar->resolveFromProvider('phone', $phone, [
                'display_name' => ($validated['display_name'] ?? null) ?: __('ACE Voter'),
                'phone' => $phone,
            ]);
            $voter = $resolution->voter;
        } else {
            $voter->update(['last_login_at' => now()]);
        }

        return $this->redirector->loginAndRedirect($voter);
    }

    private function normalizeOrFail(string $input): string
    {
        try {
            return PhoneNumber::normalize($input);
        } catch (InvalidArgumentException) {
            throw ValidationException::withMessages([
                'phone' => __('Enter a valid Ethiopian phone number, e.g. 09… or +2519…'),
            ]);
        }
    }
}
