<?php

return [
    /*
    |--------------------------------------------------------------------------
    | SocialCon Africa event settings
    |--------------------------------------------------------------------------
    | Single source of truth for event dates, venue, and contact details used
    | by controllers, seeders, and the agenda ICS generator.
    */

    'event' => [
        'name' => 'SocialCon Africa 2026',
        'timezone' => 'Africa/Addis_Ababa',
        'starts_at' => '2026-10-24T08:00:00+03:00',
        'ends_at' => '2026-10-25T23:00:00+03:00',
        'venue' => 'Skylight Hotel, Addis Ababa, Ethiopia',
    ],

    'contact' => [
        'email' => 'info@socialconafrica.com',
        'phone' => '+251 123 456 789',
        'address' => 'Skylight Hotel, Addis Ababa, Ethiopia',
        'linkedin' => 'https://www.linkedin.com/company/socialcon-africa',
        'handle' => '@SocialconAfrica',
    ],

    'currency' => 'USD',
];
