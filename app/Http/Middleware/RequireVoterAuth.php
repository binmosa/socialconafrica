<?php

namespace App\Http\Middleware;

use App\Services\Identity\PostLoginRedirector;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RequireVoterAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::guard('voter')->check()) {
            PostLoginRedirector::rememberIntent($request->fullUrl());

            $locale = $request->attributes->get('locale', SetLocale::DEFAULT);

            return redirect()->route('login', ['locale' => $locale]);
        }

        return $next($request);
    }
}
