<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AdminProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the profile page
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get admin profile by email
        $adminProfile = AdminProfile::where('email', $user->email)->first();
        
        return Inertia::render('Web/home/SuperAdmin/Profile', [
            'adminProfile' => $adminProfile,
        ]);
    }

    /**
     * Update the profile information
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'bio' => ['nullable', 'string', 'max:500'],
            'department' => ['nullable', 'string', 'max:100'],
            'position' => ['nullable', 'string', 'max:100'],
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ]);

        // Handle avatar upload
        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            // Get existing admin profile to delete old avatar
            $adminProfile = AdminProfile::where('email', $user->email)->first();
            if ($adminProfile && $adminProfile->avatar && Storage::disk('public')->exists($adminProfile->avatar)) {
                Storage::disk('public')->delete($adminProfile->avatar);
            }

            // Store new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        // Prepare admin profile data
        $profileData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'department' => $validated['department'] ?? null,
            'position' => $validated['position'] ?? null,
        ];

        if ($avatarPath) {
            $profileData['avatar'] = $avatarPath;
        }

        // Handle password change
        if (!empty($validated['password'])) {
            // Add password to profile data (will be auto-hashed by model)
            $profileData['password'] = $validated['password'];
            
            // Sync password to users table for authentication
            $user->password = Hash::make($validated['password']);
        }

        // Create or update admin profile using email as the key
        // Get existing profile if it exists
        $adminProfile = AdminProfile::where('email', $user->email)->first();
        
        if ($adminProfile) {
            // If email is changing, we need to handle it carefully
            if ($adminProfile->email !== $validated['email']) {
                // Delete old profile if email is changing
                $adminProfile->delete();
                // Create new profile with new email
                AdminProfile::create($profileData);
            } else {
                // Update existing profile
                $adminProfile->update($profileData);
            }
        } else {
            // Create new profile
            AdminProfile::create($profileData);
        }

        // Sync email to users table for authentication (only email, not other fields)
        if ($user->email !== $validated['email']) {
            $user->email = $validated['email'];
        }

        $user->save();

        return redirect()->route('superadmin.profile')->with('success', 'Profile updated successfully.');
    }
}
