<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\LocaleController;
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

Route::prefix('{locale}')
    ->whereIn('locale', SetLocale::SUPPORTED)
    ->middleware('locale')
    ->group(function () {
        Route::get('/', [HomeController::class, 'index'])->name('home');
    });

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
