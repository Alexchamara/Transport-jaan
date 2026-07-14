<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VendorProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isBusiness = $this->user()->vendor_type === 'business';

        $rules = [
            'company_name' => 'required|string|max:255',
            'business_registration_no' => $isBusiness ? 'required|string|max:100' : 'nullable|string|max:100',
            'tax_id' => 'nullable|string|max:100',
            'business_type' => $isBusiness ? 'required|in:company,partnership' : 'nullable|in:individual,company,partnership',
            'description' => 'nullable|string|max:1000',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:3072',
            'website' => 'nullable|url|max:255',
            'established_year' => 'nullable|digits:4|integer|min:1900|max:' . date('Y'),
            'employee_count' => 'nullable|string|max:50',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'required|string|max:100',
            'contact_person' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:20',
            'contact_email' => 'required|email|max:255',
        ];

        return $rules;
    }

    public function messages(): array
    {
        $isBusiness = $this->user()->vendor_type === 'business';

        return [
            'company_name.required' => $isBusiness
                ? 'Please enter your company or business name.'
                : 'Please enter your full name.',
            'business_registration_no.required' => $isBusiness
                ? 'Please enter your business registration number.'
                : 'Please enter your NIC number.',
            'business_type.required' => 'Please select your business type.',
            'address_line1.required' => 'Please enter your address.',
            'city.required' => 'Please enter your city.',
            'country.required' => 'Please enter your country.',
            'contact_person.required' => 'Please enter the contact person name.',
            'contact_phone.required' => 'Please enter a contact phone number.',
            'contact_email.required' => 'Please enter a contact email address.',
            'contact_email.email' => 'Please enter a valid email address.',
            'logo.image' => 'Logo must be an image file.',
            'logo.max' => 'Logo must be less than 3MB.',
            'established_year.digits' => 'Please enter a valid 4-digit year.',
        ];
    }
}
