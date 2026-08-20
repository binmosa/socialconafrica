<?php

namespace Tests\Feature\Catalog;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class HomePageTest extends TestCase
{
    use RefreshDatabase;

    public function test_root_redirects_to_a_supported_locale(): void
    {
        $response = $this->get('/');

        $response->assertRedirect();
        $this->assertMatchesRegularExpression('#/(en|am)$#', $response->headers->get('Location'));
    }

    public function test_home_renders_categories_and_featured_nominees(): void
    {
        $this->seed();

        $response = $this->get('/en');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('home')
            ->has('categories', 8)
            ->has('featuredNominees', 8)
            ->where('categories.0.name', 'Lifestyle')
            ->where('locale', 'en')
            ->where('votingWindow.is_open', false)
        );
    }

    public function test_home_renders_in_amharic(): void
    {
        $this->seed();

        $response = $this->get('/am');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('home')
            ->where('locale', 'am')
            ->where('categories.0.name', 'የአኗኗር ዘይቤ')
        );
    }
}
