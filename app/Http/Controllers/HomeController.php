<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('home', [
            'meta' => [
                'title' => __('site.meta.title'),
                'description' => __('site.meta.description'),
            ],
        ]);
    }
}
