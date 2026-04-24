<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\SuperAdminCourierWorkspace;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdminCourierPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        if (!Auth::check()) {
            return redirect()->route('signin.signin')->with('error', 'Please login to access this area.');
        }

        $user = Auth::user();

        if (!$user instanceof User) {
            abort(403, 'Access denied. User context is invalid.');
        }

        if ((string) ($user->role ?? '') !== 'SuperAdmin') {
            abort(403, 'Access denied. Super Admin privileges required.');
        }

        if ($permission === '') {
            return $next($request);
        }

        $workspaceId = SuperAdminCourierWorkspace::idForUser($user);
        app(PermissionRegistrar::class)->setPermissionsTeamId($workspaceId);

        if ((bool) $user->can($permission) || $this->shouldAllowBootstrapAccess($user)) {
            return $next($request);
        }

        abort(403, 'Access denied. Missing required superadmin courier permission.');
    }

    private function shouldAllowBootstrapAccess(User $user): bool
    {
        if (!config('courier.superadmin_rbac.bootstrap_allow_all', true)) {
            return false;
        }

        $prefix = (string) config('courier.superadmin_rbac.permission_prefix', 'superadmin.courier.');
        $assignedPermissions = $user->getAllPermissions()
            ->pluck('name')
            ->filter(fn ($name) => str_starts_with((string) $name, $prefix));

        return $assignedPermissions->isEmpty();
    }
}
