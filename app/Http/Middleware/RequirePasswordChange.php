<?php

namespace App\Http\Middleware;

use App\Models\VendorUserMembership;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RequirePasswordChange
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();

        if (!$user->must_change_password) {
            return $next($request);
        }

        $routeName = (string) ($request->route()?->getName() ?? '');

        $membership = VendorUserMembership::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if ($membership) {
            $allowedTeamRoutes = [
                'courierService.dashboard',
                'courierService.bookings',
                'courierService.units',
                'courierService.tracking',
                'courierService.clients',
                'courierService.team.index',
                'courierService.payment',
                'courierService.expenses',
                'courierService.settingsPage',
                'courierService.profile',
                'courierService.profile.update',
                'password.update',
                'logout',
                'logout.alt',
            ];

            if (in_array($routeName, $allowedTeamRoutes, true)) {
                return $next($request);
            }

            return redirect()->route('courierService.profile')->with([
                'error' => 'Please update your password before continuing.',
                'password_change_required' => true,
                'password_change_target' => route('courierService.profile') . '?tab=security',
            ]);
        }

        $allowed = [
            'profile.edit',
            'profile.update',
            'password.update',
            'logout',
            'logout.alt',
            'courierService.profile',
            'courierService.profile.update',
        ];

        if (in_array($routeName, $allowed, true)) {
            return $next($request);
        }

        return redirect()->route('profile.edit')->with([
            'error' => 'Please update your password before continuing.',
            'password_change_required' => true,
            'password_change_target' => route('profile.edit'),
        ]);
    }
}
