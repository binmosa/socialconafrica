<?php

namespace App\Http\Controllers;

use App\Http\Middleware\SetLocale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    public function switch(Request $request, string $locale): RedirectResponse
    {
        if (! in_array($locale, SetLocale::SUPPORTED, true)) {
            abort(404);
        }

        $previous = url()->previous();
        $host = parse_url(config('app.url'), PHP_URL_HOST);
        $prevHost = parse_url($previous, PHP_URL_HOST);

        $path = $prevHost && $prevHost !== $host
            ? '/'
            : (parse_url($previous, PHP_URL_PATH) ?: '/');

        $segments = array_values(array_filter(explode('/', $path)));
        if (isset($segments[0]) && in_array($segments[0], SetLocale::SUPPORTED, true)) {
            $segments[0] = $locale;
        } else {
            array_unshift($segments, $locale);
        }

        return redirect('/'.implode('/', $segments));
    }
}
