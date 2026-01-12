<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
   public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'vendor_type' => $user->vendor_type,
                    'status' => $user->status,
                    // Only include these when needed - reduces data size
                    'phone' => $user->phone,
                    'image' => $user->image ? asset('storage/' . $user->image) : null,
                    // Note: Removed address, country, date_of_birth from default share
                    // to reduce cookie size. Add them back individually on pages that need them.
                ] : null,
            ],
            // expose Laravel flash messages to the front end
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}
