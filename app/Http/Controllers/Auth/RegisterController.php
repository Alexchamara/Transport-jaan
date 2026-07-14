<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Rules\PasswordStrength;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('Web/home/auth/Register', [
            'role' => $request->role ?? 'client'
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email'
            ],
            'password' => [
                'required',
                'confirmed',
                Rules\Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
                new PasswordStrength(),
            ],
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date|before:today',
            'role_type' => 'required|in:client,vendor',
            'vendor_type' => 'required_if:role_type,client,vendor|in:individual,business',
        ], [
            'name.required' => 'Name is required.',
            'email.required' => 'Email is required.',
            'email.email' => 'Invalid email format.',
            'email.unique' => 'Email already exists.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password too short.',
            'password.mixed' => 'Use upper & lowercase.',
            'password.numbers' => 'Include numbers.',
            'password.symbols' => 'Include symbols.',
            'password.confirmed' => 'Passwords don\'t match.',
            'phone.required' => 'Phone is required.',
            'date_of_birth.before' => 'Invalid date.',
            'role_type.required' => 'Role is required.',
            'vendor_type.required_if' => 'Vendor type required.',
        ]);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role_type'],
                'status' => $validated['role_type'] === 'client' ? 'verified' : 'unverified',
                'phone' => $validated['phone'],
                'address' => $validated['address'] ?? null,
                'country' => $validated['country'] ?? null,
                'vendor_type' => $validated['vendor_type'],
            ]);
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Unable to create account. Please try again.'
            ])->withInput($request->except(['password', 'password_confirmation']));
        }

        // Additional vendor-specific data handling can be added here
        if ($request->role_type === 'vendor') {
            // Create vendor profile or additional vendor data
        }

        return redirect()->route('signin.signin');
    }
}
