<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @if (str_starts_with($page['component'] ?? '', 'site/'))
            {{-- Nexus template stylesheets — order matters, main.css must load last. --}}
            <link rel="stylesheet" href="/template/css/plugins/bootstrap.min.css">
            <link rel="stylesheet" href="/template/css/plugins/aos.css">
            <link rel="stylesheet" href="/template/css/plugins/fontawesome.css">
            <link rel="stylesheet" href="/template/css/plugins/magnific-popup.css">
            <link rel="stylesheet" href="/template/css/plugins/owlcarousel.min.css">
            <link rel="stylesheet" href="/template/css/plugins/sidebar.css">
            <link rel="stylesheet" href="/template/css/plugins/slick-slider.css">
            <link rel="stylesheet" href="/template/css/plugins/nice-select.css">
            <link rel="stylesheet" href="/template/css/main.css">
            <style>
                html, body {
                    background-color: #11082B;
                }
            </style>
        @endif

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
