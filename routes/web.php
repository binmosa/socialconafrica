<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\Auth\AccountLinkController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\PhoneOtpController;
use App\Http\Controllers\Auth\TelegramAuthController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\NomineeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WinnersController;
use App\Http\Middleware\EnsureLowRiskVoter;
use App\Http\Middleware\SetLocale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function (Request $request) {
    $preferred = $request->getPreferredLanguage(SetLocale::SUPPORTED) ?? SetLocale::DEFAULT;

    return redirect('/'.$preferred);
})->name('root');

Route::post('locale/{locale}', [LocaleController::class, 'switch'])
    ->whereIn('locale', SetLocale::SUPPORTED)
    ->name('locale.switch');

// OAuth callbacks live outside the locale prefix (fixed redirect URIs).
Route::get('auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google');
Route::get('auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');
Route::match(['get', 'post'], 'auth/telegram/callback', TelegramAuthController::class)->name('auth.telegram');

// Client analytics beacon (funnel events, whitelisted server-side).
Route::post('events', [AnalyticsController::class, 'store'])
    ->middleware('throttle:60,1')
    ->name('analytics.store');

Route::prefix('{locale}')
    ->whereIn('locale', SetLocale::SUPPORTED)
    ->middleware('locale')
    ->group(function () {
        Route::get('/', [HomeController::class, 'index'])->name('home');
        Route::get('nominees', [NomineeController::class, 'index'])->name('nominees.index');
        Route::get('vote/{nominee:share_slug}', [NomineeController::class, 'show'])->name('nominees.show');
        Route::get('leaderboard', [LeaderboardController::class, 'index'])->name('leaderboard');
        Route::get('leaderboard/{category:slug}', [LeaderboardController::class, 'category'])->name('leaderboard.category');
        Route::inertia('how-to-vote', 'how-to-vote')->name('how-to-vote');
        Route::inertia('prizes', 'prizes')->name('prizes');
        Route::get('winners', [WinnersController::class, 'index'])->name('winners');

        // Voter auth
        Route::get('login', [LoginController::class, 'show'])->name('login');
        Route::post('logout', [LoginController::class, 'destroy'])->name('logout');
        Route::post('otp', [PhoneOtpController::class, 'store'])
            ->middleware('throttle:10,60')->name('otp.send');
        Route::post('otp/verify', [PhoneOtpController::class, 'verify'])
            ->middleware('throttle:15,15')->name('otp.verify');
        Route::get('auth/link', [AccountLinkController::class, 'show'])->name('auth.link');
        Route::post('auth/link/send', [AccountLinkController::class, 'send'])
            ->middleware('throttle:10,60')->name('auth.link.send');
        Route::post('auth/link', [AccountLinkController::class, 'store'])
            ->middleware('throttle:15,15')->name('auth.link.store');

        // Payment return page is display-only and must work even with a
        // dead session, so it sits outside the auth group.
        Route::get('orders/{order:reference}/return', [PaymentController::class, 'show'])->name('orders.return');

        // Authenticated voter area
        Route::middleware('voter.auth')->group(function () {
            Route::get('me', [ProfileController::class, 'show'])->name('me');

            Route::middleware(EnsureLowRiskVoter::class)->group(function () {
                Route::get('vote/{nominee:share_slug}/checkout', [CheckoutController::class, 'create'])->name('checkout');
                Route::post('vote/{nominee:share_slug}/orders', [CheckoutController::class, 'store'])
                    ->middleware('throttle:10,10')->name('orders.store');
                Route::post('orders/{order:reference}/retry', [PaymentController::class, 'retry'])
                    ->middleware('throttle:10,10')->name('orders.retry');
            });
        });
    });
