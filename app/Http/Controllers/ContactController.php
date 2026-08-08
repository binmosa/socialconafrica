<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactRequest;
use App\Models\FormSubmission;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('site/contact', [
            'meta' => ['title' => __('site.contact.meta_title')],
            'contact' => [
                'email' => config('site.contact.email'),
                'phone' => config('site.contact.phone'),
                'address' => config('site.contact.address'),
                'linkedin' => config('site.contact.linkedin'),
                'handle' => config('site.contact.handle'),
            ],
        ]);
    }

    public function store(StoreContactRequest $request): RedirectResponse
    {
        FormSubmission::create([
            'kind' => 'contact',
            ...$request->validated(),
            'locale' => app()->getLocale(),
        ]);

        return back()->with('success', __('site.contact.success'));
    }
}
