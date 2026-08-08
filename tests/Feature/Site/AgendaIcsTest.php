<?php

namespace Tests\Feature\Site;

use App\Models\AgendaItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgendaIcsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_ics_download_contains_localized_event_in_utc(): void
    {
        $keynote = AgendaItem::where('kind', 'keynote')->firstOrFail();

        $response = $this->get("/en/agenda/{$keynote->id}/calendar.ics");

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/calendar; charset=utf-8');

        $body = $response->getContent();
        $this->assertStringContainsString('BEGIN:VCALENDAR', $body);
        $this->assertStringContainsString('SUMMARY:Keynote: The African Creator Economy Revolution', $body);
        // 09:30 Addis (UTC+3) → 06:30 UTC on Oct 24 2026.
        $this->assertStringContainsString('DTSTART:20261024T063000Z', $body);
    }

    public function test_ics_summary_is_localized(): void
    {
        $keynote = AgendaItem::where('kind', 'keynote')->firstOrFail();

        $body = $this->get("/fr/agenda/{$keynote->id}/calendar.ics")->getContent();

        $this->assertStringContainsString("SUMMARY:Discours d'ouverture", $body);
    }
}
