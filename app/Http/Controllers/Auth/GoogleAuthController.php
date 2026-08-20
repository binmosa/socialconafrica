<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Identity\PostLoginRedirector;
use App\Services\Identity\VoterRegistrar;
use Illuminate\Http\RedirectResponse;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirect;
use Throwable;

class GoogleAuthController extends Controller
{
    public function __construct(
        private readonly VoterRegistrar $registrar,
        private readonly PostLoginRedirector $redirector,
    ) {}

    public function redirect(): SymfonyRedirect
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable) {
            return redirect()
                ->route('login', ['locale' => app()->getLocale()])
                ->with('error', __('Google sign-in was cancelled or failed. Please try again.'));
        }

        $resolution = $this->registrar->resolveFromProvider('google', (string) $googleUser->getId(), [
            'display_name' => $googleUser->getName() ?: ($googleUser->getNickname() ?: 'ACE Voter'),
            'email' => $googleUser->getEmail(),
            'metadata' => ['avatar' => $googleUser->getAvatar()],
        ]);

        if ($resolution->requiresLinking) {
            session()->put(AccountLinkController::PENDING_LINK_KEY, $resolution->pendingLink);

            return redirect()->route('auth.link', ['locale' => app()->getLocale()]);
        }

        return $this->redirector->loginAndRedirect($resolution->voter);
    }
}
