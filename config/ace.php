<?php

return [

    /*
    |--------------------------------------------------------------------------
    | ACE Awards platform configuration
    |--------------------------------------------------------------------------
    |
    | Static platform configuration. Anything an admin should be able to
    | change at runtime (voting window, raffle cutoffs, kill switches)
    | lives in the settings table via SettingsService instead.
    |
    */

    'brand' => [
        'name' => 'SocialCon Africa Digital Excellence Awards',
        'edition' => 'Ethiopia 2026',
    ],

    // Business timezone used for raffle windows and voting schedule display.
    'timezone' => 'Africa/Addis_Ababa',

    'pricing' => [
        // 1 vote = 10 ETB, stored in minor units (cents).
        'unit_price_minor' => 1000,
        'currency' => 'ETB',
        'version' => 'v1-flat-1000',
        'preset_quantities' => [1, 2, 3, 5, 10, 25, 50, 100],
        'minimum_amount_minor' => 1000,
    ],

    'payments' => [
        // Driver key resolved to a PaymentGateway implementation: santimpay | fake | log
        'driver' => env('ACE_PAYMENT_DRIVER', 'fake'),

        // How long an attempt may stay PENDING/UNKNOWN before reconciliation expires it.
        'reconcile_after_minutes' => 5,
        'expire_after_hours' => 24,

        'santimpay' => [
            'merchant_id' => env('SANTIMPAY_MERCHANT_ID'),
            'private_key' => env('SANTIMPAY_PRIVATE_KEY'),
            'base_url' => env('SANTIMPAY_BASE_URL', 'https://services.santimpay.com/api/v1/gateway'),
            'webhook_secret' => env('SANTIMPAY_WEBHOOK_SECRET'),
        ],
    ],

    'sms' => [
        // Driver key resolved to an SmsSender implementation: log | fake | afromessage
        'driver' => env('ACE_SMS_DRIVER', 'log'),

        'afromessage' => [
            'api_key' => env('AFROMESSAGE_API_KEY'),
            'sender' => env('AFROMESSAGE_SENDER'),
        ],
    ],

    'otp' => [
        'length' => 6,
        'expires_minutes' => 5,
        'max_verify_attempts' => 5,
    ],

    'auth' => [
        // Google OAuth credentials live in config/services.php (Socialite convention).
        'telegram' => [
            'bot_username' => env('TELEGRAM_BOT_USERNAME'),
            'bot_token' => env('TELEGRAM_BOT_TOKEN'),
            // Reject Telegram login payloads older than this many seconds.
            'max_auth_age' => 300,
        ],
    ],

];
