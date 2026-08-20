<?php

namespace Tests\Feature\Auth;

use App\Models\PhoneOtp;
use App\Models\Voter;
use App\Services\Sms\FakeSmsSender;
use App\Services\Sms\SmsSender;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class PhoneOtpLoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        RateLimiter::clear('otp-send:+251911223344');
    }

    private function fakeSms(): FakeSmsSender
    {
        return app(SmsSender::class);
    }

    private function extractCode(string $phone): string
    {
        $message = $this->fakeSms()->lastMessageFor($phone);
        preg_match('/(\d{6})/', (string) $message, $matches);

        return $matches[1];
    }

    public function test_requesting_a_code_sends_sms_and_stores_hashed_otp(): void
    {
        $response = $this->from('/en/login')->post('/en/otp', ['phone' => '0911223344']);

        $response->assertRedirect('/en/login');
        $response->assertSessionHas('otp_phone', '+251911223344');

        $this->assertNotNull($this->fakeSms()->lastMessageFor('+251911223344'));

        $otp = PhoneOtp::query()->sole();
        $this->assertSame('+251911223344', $otp->phone);
        $this->assertNotSame($this->extractCode('+251911223344'), $otp->code_hash);
    }

    public function test_invalid_phone_number_is_rejected(): void
    {
        $this->from('/en/login')->post('/en/otp', ['phone' => '12345'])
            ->assertSessionHasErrors('phone');
    }

    public function test_verifying_the_code_creates_and_logs_in_a_voter(): void
    {
        $this->post('/en/otp', ['phone' => '0911223344']);
        $code = $this->extractCode('+251911223344');

        $response = $this->post('/en/otp/verify', [
            'phone' => '0911223344',
            'code' => $code,
            'display_name' => 'Hana Tester',
        ]);

        $response->assertRedirect(route('home', ['locale' => 'en']));

        $voter = Voter::query()->sole();
        $this->assertSame('+251911223344', $voter->phone);
        $this->assertNotNull($voter->phone_verified_at);
        $this->assertSame('Hana Tester', $voter->display_name);
        $this->assertSame('phone', $voter->authIdentities()->sole()->provider);
        $this->assertAuthenticatedAs($voter, 'voter');
    }

    public function test_wrong_code_is_rejected_and_attempts_are_capped(): void
    {
        $this->post('/en/otp', ['phone' => '0911223344']);

        for ($i = 0; $i < 5; $i++) {
            $this->post('/en/otp/verify', ['phone' => '0911223344', 'code' => '000000'])
                ->assertSessionHasErrors('code');
        }

        // Even the right code is refused once the attempt cap is reached.
        $code = $this->extractCode('+251911223344');
        $this->post('/en/otp/verify', ['phone' => '0911223344', 'code' => $code])
            ->assertSessionHasErrors('code');

        $this->assertGuest('voter');
    }

    public function test_send_rate_limit_blocks_a_fourth_code_in_the_window(): void
    {
        foreach (range(1, 3) as $i) {
            $this->post('/en/otp', ['phone' => '0911223344'])->assertSessionDoesntHaveErrors();
        }

        $this->post('/en/otp', ['phone' => '0911223344'])->assertSessionHasErrors('phone');
    }

    public function test_returning_voter_logs_in_without_creating_a_duplicate(): void
    {
        $voter = Voter::factory()->create([
            'phone' => '+251911223344',
            'phone_verified_at' => now(),
        ]);

        $this->post('/en/otp', ['phone' => '+251911223344']);
        $code = $this->extractCode('+251911223344');

        $this->post('/en/otp/verify', ['phone' => '+251911223344', 'code' => $code]);

        $this->assertSame(1, Voter::query()->count());
        $this->assertAuthenticatedAs($voter, 'voter');
    }
}
