<?php

namespace App\Http\Middleware;

use App\Services\Courier\CourierTeamSecurityAuditService;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpFoundation\Response;

class EnsureServicePermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        if (!Auth::check()) {
            return redirect()->route('signin.signin')->with('message', 'Please log in to continue.');
        }

        $user = Auth::user();
        $workspaceId = (int) $request->attributes->get('service_workspace_id');

        if ($workspaceId <= 0) {
            abort(403, 'Service workspace context missing.');
        }

        // Always evaluate permissions inside the current workspace only.
        app(PermissionRegistrar::class)->setPermissionsTeamId($workspaceId);

        if (!$this->hasWorkspacePermission($user, $permission, $workspaceId)) {
            if (str_starts_with((string) $request->route()?->getName(), 'courierService.')) {
                app(CourierTeamSecurityAuditService::class)->recordPermissionDenied(
                    $request,
                    'missing_required_permission',
                    ['required_permission' => $permission]
                );
            }

            if ($request->expectsJson() || $request->isXmlHttpRequest()) {
                abort(403, 'Missing required permission: ' . $permission);
            }

            $message = 'You do not have permission to access this section.';
            $currentUrl = $request->fullUrl();
            $previousUrl = (string) $request->headers->get('referer', '');

            if ($previousUrl !== '' && $previousUrl !== $currentUrl) {
                return redirect()->to($previousUrl)->with('error', $message);
            }

            $courierFallbacks = [
                'courierService.dashboard' => 'courier.dashboard.view',
                'courierService.bookings' => 'courier.bookings.view',
                'courierService.units' => 'courier.shipments.view',
                'courierService.tracking' => 'courier.tracking.view',
                'courierService.clients' => 'courier.clients.view',
                'courierService.calendar' => 'courier.calendar.view',
                'courierService.settingsPage' => 'courier.settings.view',
                'courierService.profile' => 'courier.profile.view',
            ];

            foreach ($courierFallbacks as $routeName => $requiredPermission) {
                if (!Route::has($routeName)) {
                    continue;
                }

                if ($this->hasWorkspacePermission($user, $requiredPermission, $workspaceId)) {
                    return redirect()->route($routeName)->with('error', $message);
                }
            }

            if (Route::has('vendorAllBookings')) {
                return redirect()->route('vendorAllBookings')->with('error', $message);
            }

            return redirect('/')->with('error', $message);
        }

        return $next($request);
    }

    private function hasWorkspacePermission(Model $user, string $permissionName, int $workspaceId): bool
    {
        $registrar = app(PermissionRegistrar::class);
        $permissionClass = $registrar->getPermissionClass();
        $permission = $permissionClass::query()
            ->where('name', $permissionName)
            ->where('guard_name', config('auth.defaults.guard', 'web'))
            ->first();

        if (!$permission) {
            return false;
        }

        $modelType = $user->getMorphClass();

        $hasDirectPermission = DB::table(config('permission.table_names.model_has_permissions'))
            ->where('permission_id', $permission->id)
            ->where(config('permission.column_names.model_morph_key', 'model_id'), $user->getKey())
            ->where('model_type', $modelType)
            ->where(config('permission.column_names.team_foreign_key', 'service_workspace_id'), $workspaceId)
            ->exists();

        if ($hasDirectPermission) {
            return true;
        }

        return DB::table(config('permission.table_names.model_has_roles') . ' as mhr')
            ->join(config('permission.table_names.role_has_permissions') . ' as rhp', 'mhr.role_id', '=', 'rhp.role_id')
            ->where('rhp.permission_id', $permission->id)
            ->where('mhr.' . config('permission.column_names.model_morph_key', 'model_id'), $user->getKey())
            ->where('mhr.model_type', $modelType)
            ->where('mhr.' . config('permission.column_names.team_foreign_key', 'service_workspace_id'), $workspaceId)
            ->exists();
    }
}
