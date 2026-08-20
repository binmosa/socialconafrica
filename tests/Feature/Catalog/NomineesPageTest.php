<?php

namespace Tests\Feature\Catalog;

use App\Models\Nominee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class NomineesPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_lists_all_active_nominees(): void
    {
        $this->seed();

        $response = $this->get('/en/nominees');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('nominees/index')
            ->has('nominees', 8)
            ->has('categories', 8)
        );
    }

    public function test_search_matches_partial_names_and_handle_prefix(): void
    {
        $this->seed();

        $this->get('/en/nominees?q=hana')->assertInertia(fn (AssertableInertia $page) => $page
            ->has('nominees', 1)
            ->where('nominees.0.display_name', 'Hana Digital')
        );

        $this->get('/en/nominees?q=@sami-tech')->assertInertia(fn (AssertableInertia $page) => $page
            ->has('nominees', 1)
            ->where('nominees.0.handle', 'sami-tech')
        );
    }

    public function test_category_filter_limits_results(): void
    {
        $this->seed();

        $this->get('/en/nominees?category=comedy')->assertInertia(fn (AssertableInertia $page) => $page
            ->has('nominees', 1)
            ->where('nominees.0.display_name', 'Dawit Comedy')
            ->where('filters.category', 'comedy')
        );
    }

    public function test_share_slug_deep_link_renders_nominee_page(): void
    {
        $this->seed();

        $response = $this->get('/en/vote/hana-digital');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('nominees/show')
            ->where('nominee.display_name', 'Hana Digital')
            ->where('nominee.handle', 'hana-digital')
        );
    }

    public function test_hidden_nominee_is_not_reachable(): void
    {
        $nominee = Nominee::factory()->hidden()->create();

        $this->get('/en/vote/'.$nominee->share_slug)->assertNotFound();
    }

    public function test_hidden_nominees_are_excluded_from_the_index(): void
    {
        Nominee::factory()->count(2)->create();
        Nominee::factory()->hidden()->create();

        $this->get('/en/nominees')->assertInertia(fn (AssertableInertia $page) => $page
            ->has('nominees', 2)
        );
    }
}
