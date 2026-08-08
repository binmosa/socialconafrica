<?php

namespace Tests\Feature\Site;

use App\Models\FormSubmission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_submission_is_persisted_with_locale(): void
    {
        $response = $this->from('/fr/contact')->post('/fr/contact', [
            'first_name' => 'Awa',
            'last_name' => 'Diop',
            'email' => 'awa@example.com',
            'message' => 'Bonjour, je souhaite devenir partenaire.',
        ]);

        $response->assertRedirect('/fr/contact');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('form_submissions', [
            'kind' => 'contact',
            'first_name' => 'Awa',
            'email' => 'awa@example.com',
            'locale' => 'fr',
        ]);
    }

    public function test_invalid_submission_is_rejected(): void
    {
        $response = $this->from('/en/contact')->post('/en/contact', [
            'first_name' => '',
            'email' => 'not-an-email',
            'message' => '',
        ]);

        $response->assertSessionHasErrors(['first_name', 'email', 'message']);
        $this->assertSame(0, FormSubmission::count());
    }
}
