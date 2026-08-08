<?php

namespace App\Http\Controllers;

use App\Models\AgendaDay;
use App\Models\AgendaItem;
use Carbon\CarbonImmutable;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class AgendaController extends Controller
{
    public function index(): Response
    {
        $locale = app()->getLocale();

        return Inertia::render('site/agenda', [
            'meta' => ['title' => __('site.agenda.meta_title')],
            'days' => AgendaDay::with('items')
                ->orderBy('sort_order')
                ->get()
                ->map(fn (AgendaDay $day): array => [
                    'id' => $day->id,
                    'label' => $day->getTranslation('label', $locale),
                    'title' => $day->getTranslation('title', $locale),
                    'items' => $day->items->map(fn (AgendaItem $item): array => [
                        'id' => $item->id,
                        'time' => substr($item->starts_at, 0, 5).($item->ends_at ? ' - '.substr($item->ends_at, 0, 5) : ''),
                        'kind' => $item->kind,
                        'track' => $item->track,
                        'title' => $item->getTranslation('title', $locale),
                        'description' => $item->getTranslation('description', $locale),
                        'location' => $item->getTranslation('location', $locale),
                        'speaker' => $item->speaker_name,
                        'icsUrl' => route('agenda.ics', ['locale' => $locale, 'agendaItem' => $item->id]),
                    ]),
                ]),
        ]);
    }

    public function ics(string $locale, AgendaItem $agendaItem): HttpResponse
    {
        $timezone = config('site.event.timezone');
        $date = $agendaItem->day->date->format('Y-m-d');

        $start = CarbonImmutable::parse("{$date} {$agendaItem->starts_at}", $timezone)->utc();
        $end = $agendaItem->ends_at
            ? CarbonImmutable::parse("{$date} {$agendaItem->ends_at}", $timezone)->utc()
            : $start->addHour();

        $escape = fn (string $value): string => str_replace(['\\', ';', ',', "\n"], ['\\\\', '\;', '\,', '\n'], $value);

        $lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//SocialCon Africa//Agenda//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            "UID:agenda-item-{$agendaItem->id}@socialconafrica.com",
            'DTSTAMP:'.now()->utc()->format('Ymd\THis\Z'),
            'DTSTART:'.$start->format('Ymd\THis\Z'),
            'DTEND:'.$end->format('Ymd\THis\Z'),
            'SUMMARY:'.$escape($agendaItem->getTranslation('title', app()->getLocale())),
            'DESCRIPTION:'.$escape((string) $agendaItem->getTranslation('description', app()->getLocale())),
            'LOCATION:'.$escape((string) $agendaItem->getTranslation('location', app()->getLocale()).', '.config('site.event.venue')),
            'END:VEVENT',
            'END:VCALENDAR',
        ];

        return response(implode("\r\n", $lines), 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="socialcon-session-'.$agendaItem->id.'.ics"',
        ]);
    }
}
