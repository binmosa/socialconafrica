<?php

namespace App\Services\Identity;

use App\Models\PhoneOtp;
use App\Services\Sms\SmsSender;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class OtpService
{
    public function __construct(private readonly SmsSender $sms) {}

    /**
     * Issue and send a one-time code. Returns false when rate limited.
     */
    public function request(string $phone, string $purpose = 'login'): bool
    {
        $allowed = RateLimiter::attempt(
            key: 'otp-send:'.$phone,
            maxAttempts: 3,
            callback: fn (): bool => true,
            decaySeconds: 15 * 60,
        );

        if ($allowed === false) {
            return false;
        }

        // Invalidate previous outstanding codes for this phone + purpose.
        PhoneOtp::query()
            ->where('phone', $phone)
            ->where('purpose', $purpose)
            ->whereNull('consumed_at')
            ->update(['consumed_at' => now()]);

        $code = (string) random_int(100000, 999999);

        PhoneOtp::query()->create([
            'phone' => $phone,
            'code_hash' => Hash::make($code),
            'purpose' => $purpose,
            'expires_at' => now()->addMinutes((int) config('ace.otp.expires_minutes')),
        ]);

        $this->sms->send($phone, __('Your ACE Awards verification code is :code', ['code' => $code]));

        return true;
    }

    /**
     * Verify a code; consumes it on success.
     */
    public function verify(string $phone, string $code, string $purpose = 'login'): bool
    {
        $otp = PhoneOtp::query()
            ->where('phone', $phone)
            ->where('purpose', $purpose)
            ->whereNull('consumed_at')
            ->latest('id')
            ->first();

        if ($otp === null || $otp->isExpired()) {
            return false;
        }

        if ($otp->attempts >= (int) config('ace.otp.max_verify_attempts')) {
            return false;
        }

        $otp->increment('attempts');

        if (! Hash::check($code, $otp->code_hash)) {
            return false;
        }

        $otp->update(['consumed_at' => now()]);

        return true;
    }
}
