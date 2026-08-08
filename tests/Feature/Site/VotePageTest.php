<?php

namespace Tests\Feature\Site;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class VotePageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_vote_page_lists_categories_with_nominees_and_voting_closed(): void
    {
        $this->get('/en/vote')->assertInertia(fn (Assert $page) => $page
            ->component('site/vote')
            ->where('votingOpen', false)
            ->has('categories', 6)
            ->has('categories.0.nominees', 3)
            ->where('categories.0.name', 'Creator of the Year')
            ->where('categories.0.nominees.0.name', 'Amara Tesfaye'));
    }
}
