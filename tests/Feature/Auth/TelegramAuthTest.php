<?php

namespace Tests\Feature\Auth;

use App\Models\Voter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TelegramAuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function signPayload(array $payload): array
    {
        $data = collect($payload)
            ->map(fn (mixed $value, string $key): string => $key.'='.$value)
            ->sort()
            ->implode("\n");

        $secretKey = hash('sha256', (string) config('ace.auth.telegram.bot_token'), true);
        $payload['hash'] = hash_hmac('sha256', $data, $secretKey);

        return $payload;
    }

    public function test_valid_payload_creates_and_logs_in_a_voter(): void
    {
        $payload = $this->signPayload([
            'id' => 987654321,
            'first_name' => 'Selam',
            'last_name' => 'T',
            'username' => 'selamt',
            'auth_date' => time(),
        ]);

        $response = $this->post('/auth/telegram/callback', $payload);

        $response->assertRedirect(route('home', ['locale' => 'en']));

        $voter = Voter::query()->sole();
        $this->assertSame('Selam T', $voter->display_name);
        $identity = $voter->authIdentities()->sole();
        $this->assertSame('telegram', $identity->provider);
        $this->assertSame('987654321', $identity->provider_subject_id);
        $this->assertAuthenticatedAs($voter, 'voter');
    }

    public function test_tampered_hash_is_rejected(): void
    {
        $payload = $this->signPayload([
            'id' => 987654321,
            'first_name' => 'Selam',
            'auth_date' => time(),
        ]);

        $payload['id'] = 111111111; // tamper after signing

        $this->post('/auth/telegram/callback', $payload)
            ->assertRedirect(route('login', ['locale' => 'en']));

        $this->assertSame(0, Voter::query()->count());
        $this->assertGuest('voter');
    }

    public function test_stale_auth_date_is_rejected(): void
    {
        $payload = $this->signPayload([
            'id' => 987654321,
            'first_name' => 'Selam',
            'auth_date' => time() - 3600,
        ]);

        $this->post('/auth/telegram/callback', $payload)
            ->assertRedirect(route('login', ['locale' => 'en']));

        $this->assertGuest('voter');
    }

    public function test_returning_identity_logs_into_the_same_account(): void
    {
        $payload = $this->signPayload([
            'id' => 987654321,
            'first_name' => 'Selam',
            'auth_date' => time(),
        ]);

        $this->post('/auth/telegram/callback', $payload);
        auth('voter')->logout();

        $this->post('/auth/telegram/callback', $this->signPayload([
            'id' => 987654321,
            'first_name' => 'Selam',
            'auth_date' => time(),
        ]));

        $this->assertSame(1, Voter::query()->count());
    }
}
