<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Identity\PostLoginRedirector;
use App\Services\Identity\TelegramLoginVerifier;
use App\Services\Identity\VoterRegistrar;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TelegramAuthController extends Controller
{
    public function __construct(
        private readonly TelegramLoginVerifier $verifier,
        private readonly VoterRegistrar $registrar,
        private readonly PostLoginRedirector $redirector,
    ) {}

    public function __invoke(Request $request): RedirectResponse
    {
        $payload = $request->only([
            'id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date', 'hash',
        ]);

        if (! $this->verifier->verify($payload)) {
            return redirect()
                ->route('login', ['locale' => app()->getLocale()])
                ->with('error', __('Telegram sign-in could not be verified. Please try again.'));
        }

        $displayName = trim(($payload['first_name'] ?? '').' '.($payload['last_name'] ?? ''))
            ?: ($payload['username'] ?? 'ACE Voter');

        $resolution = $this->registrar->resolveFromProvider('telegram', (string) $payload['id'], [
            'display_name' => $displayName,
            'metadata' => [
                'username' => $payload['username'] ?? null,
                'photo_url' => $payload['photo_url'] ?? null,
            ],
        ]);

        if ($resolution->requiresLinking) {
            session()->put(AccountLinkController::PENDING_LINK_KEY, $resolution->pendingLink);

            return redirect()->route('auth.link', ['locale' => app()->getLocale()]);
        }

        return $this->redirector->loginAndRedirect($resolution->voter);
    }
}
