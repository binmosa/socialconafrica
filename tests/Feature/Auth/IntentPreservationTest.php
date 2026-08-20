<?php

namespace Tests\Feature\Auth;

use App\Services\Sms\FakeSmsSender;
use App\Services\Sms\SmsSender;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class IntentPreservationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_returned_to_the_page_they_wanted_after_login(): void
    {
        RateLimiter::clear('otp-send:+251911000222');

        // A guest heads for an auth-gated page and is bounced to login.
        $this->get('/en/me')->assertRedirect(route('login', ['locale' => 'en']));

        // They sign in with phone OTP...
        $this->post('/en/otp', ['phone' => '0911000222']);

        /** @var FakeSmsSender $sms */
        $sms = app(SmsSender::class);
        preg_match('/(\d{6})/', (string) $sms->lastMessageFor('+251911000222'), $matches);

        $response = $this->post('/en/otp/verify', [
            'phone' => '0911000222',
            'code' => $matches[1],
            'display_name' => 'Returning Voter',
        ]);

        // ...and land back on the page they originally wanted, not on search.
        $response->assertRedirect(url('/en/me'));
    }

    public function test_intent_preservation_works_in_amharic_locale(): void
    {
        RateLimiter::clear('otp-send:+251911000333');

        $this->get('/am/me')->assertRedirect(route('login', ['locale' => 'am']));

        $this->post('/am/otp', ['phone' => '0911000333']);

        /** @var FakeSmsSender $sms */
        $sms = app(SmsSender::class);
        preg_match('/(\d{6})/', (string) $sms->lastMessageFor('+251911000333'), $matches);

        $this->post('/am/otp/verify', ['phone' => '0911000333', 'code' => $matches[1]])
            ->assertRedirect(url('/am/me'));
    }
}
