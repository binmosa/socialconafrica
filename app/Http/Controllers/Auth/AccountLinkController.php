<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Identity\AccountLinkingService;
use App\Services\Identity\OtpService;
use App\Services\Identity\PhoneNumber;
use App\Services\Identity\PostLoginRedirector;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AccountLinkController extends Controller
{
    public const PENDING_LINK_KEY = 'auth.pending_link';

    public function __construct(
        private readonly OtpService $otp,
        private readonly AccountLinkingService $linking,
        private readonly PostLoginRedirector $redirector,
    ) {}

    /**
     * Explain the collision and let the person verify the phone they own.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $pending = $request->session()->get(self::PENDING_LINK_KEY);

        if (! is_array($pending)) {
            return redirect()->route('login', ['locale' => app()->getLocale()]);
        }

        return Inertia::render('auth/link', [
            'provider' => $pending['provider'],
            'phoneMasked' => PhoneNumber::mask((string) $pending['profile']['phone']),
            'otpSent' => (bool) $request->session()->get('link_otp_sent'),
        ]);
    }

    /**
     * Send the linking OTP to the phone on record.
     */
    public function send(Request $request): RedirectResponse
    {
        $pending = $request->session()->get(self::PENDING_LINK_KEY);

        if (! is_array($pending)) {
            return redirect()->route('login', ['locale' => app()->getLocale()]);
        }

        if (! $this->otp->request((string) $pending['profile']['phone'], 'link')) {
            throw ValidationException::withMessages([
                'code' => __('Too many codes requested. Please wait a few minutes and try again.'),
            ]);
        }

        return back()->with('link_otp_sent', true);
    }

    /**
     * Verify the linking OTP and attach the identity to the existing account.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate(['code' => ['required', 'digits:6']]);

        $pending = $request->session()->get(self::PENDING_LINK_KEY);

        if (! is_array($pending)) {
            return redirect()->route('login', ['locale' => app()->getLocale()]);
        }

        $phone = (string) $pending['profile']['phone'];

        if (! $this->otp->verify($phone, $validated['code'], 'link')) {
            throw ValidationException::withMessages([
                'code' => __('That code is invalid or has expired. Request a new one.'),
            ]);
        }

        $voter = $this->linking->completeLink($pending);

        $request->session()->forget(self::PENDING_LINK_KEY);

        return $this->redirector->loginAndRedirect($voter);
    }
}
