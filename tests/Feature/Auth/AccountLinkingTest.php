<?php

namespace Tests\Feature\Auth;

use App\Http\Controllers\Auth\AccountLinkController;
use App\Models\Voter;
use App\Services\Identity\VoterRegistrar;
use App\Services\Sms\FakeSmsSender;
use App\Services\Sms\SmsSender;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AccountLinkingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        RateLimiter::clear('otp-send:+251911000111');
    }

    public function test_registrar_detects_phone_collision_instead_of_duplicating(): void
    {
        Voter::factory()->create(['phone' => '+251911000111', 'phone_verified_at' => now()]);

        $resolution = app(VoterRegistrar::class)->resolveFromProvider('telegram', 'tg-9', [
            'display_name' => 'Sami',
            'phone' => '0911000111',
        ]);

        $this->assertTrue($resolution->requiresLinking);
        $this->assertSame('+251911000111', $resolution->pendingLink['profile']['phone']);
        $this->assertSame(1, Voter::query()->count());
    }

    public function test_link_flow_attaches_identity_to_existing_voter_after_otp(): void
    {
        $voter = Voter::factory()->create(['phone' => '+251911000111', 'phone_verified_at' => now()]);

        $pending = [
            'provider' => 'telegram',
            'subject' => 'tg-9',
            'profile' => ['display_name' => 'Sami', 'phone' => '+251911000111'],
        ];

        $this->withSession([AccountLinkController::PENDING_LINK_KEY => $pending])
            ->get('/en/auth/link')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('auth/link')
                ->where('provider', 'telegram')
                ->where('phoneMasked', '09*****111')
            );

        $this->withSession([AccountLinkController::PENDING_LINK_KEY => $pending])
            ->post('/en/auth/link/send')
            ->assertSessionDoesntHaveErrors();

        /** @var FakeSmsSender $sms */
        $sms = app(SmsSender::class);
        preg_match('/(\d{6})/', (string) $sms->lastMessageFor('+251911000111'), $matches);

        $this->withSession([AccountLinkController::PENDING_LINK_KEY => $pending])
            ->post('/en/auth/link', ['code' => $matches[1]])
            ->assertRedirect(route('home', ['locale' => 'en']));

        $this->assertSame(1, Voter::query()->count());
        $this->assertSame(
            ['telegram'],
            $voter->authIdentities()->pluck('provider')->all(),
        );
        $this->assertAuthenticatedAs($voter, 'voter');
    }

    public function test_link_page_without_pending_link_redirects_to_login(): void
    {
        $this->get('/en/auth/link')->assertRedirect(route('login', ['locale' => 'en']));
    }
}
