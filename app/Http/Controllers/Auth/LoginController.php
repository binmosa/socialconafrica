<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        if (Auth::guard('voter')->check()) {
            return redirect()->route('home', ['locale' => app()->getLocale()]);
        }

        return Inertia::render('auth/login', [
            'telegramBot' => config('ace.auth.telegram.bot_username'),
            'otpPhone' => $request->session()->get('otp_phone'),
        ]);
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('voter')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home', ['locale' => app()->getLocale()]);
    }
}
