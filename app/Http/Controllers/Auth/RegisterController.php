<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
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
                    ->symbols()
            ],
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:100',
            'date_of_birth' => 'required|date|before:today',
            'role_type' => 'required|in:client,vendor',
            'vendor_type' => 'required_if:role_type,vendor|in:individual,business',
        ], [
            'email.unique' => 'This email is already registered.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.mixed' => 'Password must contain both uppercase and lowercase letters.',
            'password.numbers' => 'Password must contain at least one number.',
            'password.symbols' => 'Password must contain at least one symbol.',
            'date_of_birth.before' => 'Date of birth must be in the past.',
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
                'date_of_birth' => $validated['date_of_birth'],
                'vendor_type' => $validated['role_type'] === 'vendor' ? $validated['vendor_type'] : null,
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
