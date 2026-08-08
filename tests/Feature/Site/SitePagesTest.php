<?php

namespace Tests\Feature\Site;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SitePagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_root_redirects_to_a_supported_locale(): void
    {
        $response = $this->get('/');

        $response->assertRedirect();
        $this->assertMatchesRegularExpression('#/(en|am|fr)$#', $response->headers->get('Location'));
    }

    public function test_every_site_page_renders_in_english_and_amharic(): void
    {
        $pages = [
            '' => 'site/home',
            '/agenda' => 'site/agenda',
            '/speakers' => 'site/speakers',
            '/sponsors' => 'site/sponsors',
            '/awards' => 'site/awards',
            '/vote' => 'site/vote',
            '/contact' => 'site/contact',
            '/register' => 'site/register',
        ];

        foreach (['en', 'am'] as $locale) {
            foreach ($pages as $path => $component) {
                $this->get("/{$locale}{$path}")
                    ->assertOk()
                    ->assertInertia(fn (Assert $page) => $page->component($component));
            }
        }
    }

    public function test_home_page_receives_content_props(): void
    {
        $this->get('/en')->assertInertia(fn (Assert $page) => $page
            ->component('site/home')
            ->has('speakers', 4)
            ->has('leaders', 2)
            ->has('personas', 6)
            ->has('testimonials', 3)
            ->has('sponsors', 6)
            ->where('eventDate', config('site.event.starts_at')));
    }

    public function test_template_styles_load_on_site_pages_but_not_auth_pages(): void
    {
        $this->get('/en/agenda')->assertSee('/template/css/main.css');
        $this->get('/login')->assertDontSee('/template/css/main.css');
    }
}
