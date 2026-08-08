<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomePageTest extends TestCase
{
    use RefreshDatabase;

    public function test_root_redirects_to_a_supported_locale(): void
    {
        $response = $this->get('/');

        $response->assertRedirect();
        $this->assertMatchesRegularExpression('#/(en|am|fr)$#', $response->headers->get('Location'));
    }

    public function test_home_page_renders_with_template_styles(): void
    {
        $response = $this->get('/en');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page->component('site/home'));
        $response->assertSee('/template/css/main.css');
    }

    public function test_home_page_renders_for_every_supported_locale(): void
    {
        foreach (['en', 'am', 'fr'] as $locale) {
            $this->get("/{$locale}")
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page->component('site/home'));
        }
    }

    public function test_template_styles_are_not_loaded_on_auth_pages(): void
    {
        $response = $this->get('/login');

        $response->assertOk();
        $response->assertDontSee('/template/css/main.css');
    }
}
