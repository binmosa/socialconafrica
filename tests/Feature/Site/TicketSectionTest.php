<?php

namespace Tests\Feature\Site;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TicketSectionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_home_page_exposes_ticket_tiers(): void
    {
        $this->get('/en')->assertInertia(fn (Assert $page) => $page
            ->component('site/home')
            ->has('tiers', 3)
            ->where('tiers.1.slug', 'creator')
            ->where('tiers.1.priceMinor', 19900));
    }

    public function test_register_page_preselects_tier_from_query(): void
    {
        $this->get('/en/register?tier=creator')->assertInertia(fn (Assert $page) => $page
            ->component('site/register')
            ->where('preselectedTier', 'creator'));
    }

    public function test_register_page_ignores_unknown_tier(): void
    {
        $this->get('/en/register?tier=ghost')->assertInertia(fn (Assert $page) => $page
            ->component('site/register')
            ->where('preselectedTier', null));
    }
}
