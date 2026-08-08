<?php

use App\Http\Controllers\AgendaController;
use App\Http\Controllers\AwardController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\SpeakerController;
use App\Http\Controllers\SponsorController;
use App\Http\Controllers\VoteController;
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
        Route::get('agenda', [AgendaController::class, 'index'])->name('agenda');
        Route::get('agenda/{agendaItem}/calendar.ics', [AgendaController::class, 'ics'])->name('agenda.ics');
        Route::get('speakers', [SpeakerController::class, 'index'])->name('speakers');
        Route::get('sponsors', [SponsorController::class, 'index'])->name('sponsors');
        Route::get('awards', [AwardController::class, 'index'])->name('awards');
        Route::get('vote', [VoteController::class, 'index'])->name('vote');
        Route::get('contact', [ContactController::class, 'show'])->name('contact');
        Route::post('contact', [ContactController::class, 'store'])->name('contact.store');
        Route::get('register', [RegistrationController::class, 'create'])->name('register.event');
        Route::post('register', [RegistrationController::class, 'store'])->name('register.event.store');
    });

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
