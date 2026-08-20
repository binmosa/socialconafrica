<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocaleSwitchTest extends TestCase
{
    use RefreshDatabase;

    public function test_switch_rewrites_locale_segment_and_preserves_query(): void
    {
        $response = $this->from('/en/nominees?q=hana&category=comedy')->post('/locale/am');

        $response->assertRedirect(url('/am/nominees?q=hana&category=comedy'));
    }

    public function test_switch_rejects_unsupported_locales(): void
    {
        $this->post('/locale/fr')->assertNotFound();
    }
}
