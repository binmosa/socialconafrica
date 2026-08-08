<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'country' => ['required', 'string', 'max:100'],
            'organization' => ['nullable', 'string', 'max:150'],
            'ticket_tier' => ['required', 'string', 'exists:ticket_tiers,slug'],
            'hotel' => ['required', 'string', 'exists:hotels,slug'],
            'addons' => ['array'],
            'addons.*' => ['string', 'distinct', 'exists:addons,slug'],
            'payment_method' => ['required', 'in:credit_card,paypal,bank_transfer'],
        ];
    }
}
