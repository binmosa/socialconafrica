<?php

use App\Http\Controllers\Webhooks\SantimPayWebhookController;
use Illuminate\Support\Facades\Route;

// Server-to-server only: no session, no CSRF, no locale.
Route::post('webhooks/santimpay', SantimPayWebhookController::class)
    ->name('webhooks.santimpay');
