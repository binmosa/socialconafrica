<?php

namespace Tests\Feature\Auth;

use App\Models\AuthIdentity;
use App\Models\Voter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    private function mockGoogleUser(string $id, string $name, string $email): void
    {
        $user = (new SocialiteUser)->map([
            'id' => $id,
            'name' => $name,
            'email' => $email,
            'avatar' => null,
        ]);
        $user->id = $id;

        $provider = Mockery::mock(Provider::class);
        $provider->shouldReceive('user')->andReturn($user);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }

    public function test_callback_creates_a_voter_and_identity(): void
    {
        $this->mockGoogleUser('google-123', 'Hana G', 'hana@example.com');

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect(route('home', ['locale' => 'en']));

        $voter = Voter::query()->sole();
        $this->assertSame('Hana G', $voter->display_name);
        $this->assertSame('hana@example.com', $voter->email);
        $this->assertNull($voter->phone);
        $this->assertSame('google', $voter->authIdentities()->sole()->provider);
        $this->assertAuthenticatedAs($voter, 'voter');
    }

    public function test_callback_logs_in_existing_identity_without_duplicate(): void
    {
        $voter = Voter::factory()->create();
        AuthIdentity::factory()->for($voter)->create([
            'provider' => 'google',
            'provider_subject_id' => 'google-123',
        ]);

        $this->mockGoogleUser('google-123', 'Hana G', 'hana@example.com');

        $this->get('/auth/google/callback');

        $this->assertSame(1, Voter::query()->count());
        $this->assertAuthenticatedAs($voter, 'voter');
    }
}
