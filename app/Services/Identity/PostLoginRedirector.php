<?php

namespace App\Services\Identity;

use App\Http\Middleware\SetLocale;
use App\Models\Voter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class PostLoginRedirector
{
    public const INTENT_KEY = 'vote.intent';

    /**
     * Log the voter in (persistent session) and return to where they started.
     * Critical UX rule: never send a voter back to search after auth.
     */
    public function loginAndRedirect(Voter $voter): RedirectResponse
    {
        Auth::guard('voter')->login($voter, remember: true);

        session()->regenerate();

        return $this->redirect();
    }

    public function redirect(): RedirectResponse
    {
        $intent = session()->pull(self::INTENT_KEY);

        if (is_array($intent) && isset($intent['return_path'])) {
            return redirect((string) $intent['return_path']);
        }

        $locale = app()->getLocale();
        if (! in_array($locale, SetLocale::SUPPORTED, true)) {
            $locale = SetLocale::DEFAULT;
        }

        return redirect()->route('home', ['locale' => $locale]);
    }

    /**
     * Remember where a guest was headed before being sent to login.
     */
    public static function rememberIntent(string $returnPath): void
    {
        session()->put(self::INTENT_KEY, ['return_path' => $returnPath]);
    }
}
