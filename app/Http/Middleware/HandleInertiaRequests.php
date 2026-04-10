<?php

namespace App\Http\Middleware;

use App\Models\ServiceWorkspace;
use App\Models\VendorServiceRegistration;
use App\Models\VendorUserMembership;
use App\Support\SuperAdminCourierWorkspace;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Spatie\Permission\PermissionRegistrar;

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

        $approvedServiceSlugs = [];
        $courierPermissions = [];
        $superAdminCourierPermissions = [];
        $hasExplicitSuperAdminCourierPermissions = false;
        $displayRole = null;
        $teamMembershipRole = null;
        $courierRole = null;
        if ($user) {
            $displayRole = $this->formatRoleLabel((string) $user->role);

            if ((string) $user->role === 'SuperAdmin') {
                $registrar = app(PermissionRegistrar::class);
                $workspaceId = SuperAdminCourierWorkspace::idForUser($user);
                $registrar->setPermissionsTeamId($workspaceId);

                $prefix = (string) config('courier.superadmin_rbac.permission_prefix', 'superadmin.courier.');
                $superAdminCourierPermissions = $user->getAllPermissions()
                    ->pluck('name')
                    ->filter(fn ($name) => str_starts_with((string) $name, $prefix))
                    ->unique()
                    ->values()
                    ->toArray();

                $hasExplicitSuperAdminCourierPermissions = count($superAdminCourierPermissions) > 0;
            }

            $membership = VendorUserMembership::query()
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->first();

            $teamMembershipRole = $membership?->membership_role;

            $vendorUserId = $user->role === 'vendor'
                ? $user->id
                : $membership?->vendor_user_id;

            if ($vendorUserId) {
                $approvedServiceSlugs = VendorServiceRegistration::query()
                    ->where('user_id', $vendorUserId)
                    ->where('status', 'approved')
                    ->with('serviceCategory:id,slug')
                    ->get()
                    ->pluck('serviceCategory.slug')
                    ->filter()
                    ->unique()
                    ->values()
                    ->toArray();

                $courierWorkspaceId = ServiceWorkspace::query()
                    ->where('vendor_user_id', $vendorUserId)
                    ->where('service_key', 'courier_service')
                    ->value('id');

                if ($courierWorkspaceId) {
                    $registrar = app(PermissionRegistrar::class);
                    $registrar->setPermissionsTeamId($courierWorkspaceId);

                    $courierPermissions = $user->getAllPermissions()
                        ->pluck('name')
                        ->filter(fn ($name) => str_starts_with((string) $name, 'courier.'))
                        ->unique()
                        ->values()
                        ->toArray();

                    $courierRoleName = $user->getRoleNames()
                        ->first(fn ($name) => str_starts_with((string) $name, 'courier_'));

                    if ($courierRoleName) {
                        $courierRole = (string) $courierRoleName;
                        $displayRole = $this->formatRoleLabel($courierRole);
                    } elseif ($teamMembershipRole) {
                        $displayRole = $this->formatRoleLabel((string) $teamMembershipRole);
                    }
                } elseif ($teamMembershipRole) {
                    $displayRole = $this->formatRoleLabel((string) $teamMembershipRole);
                }
            }
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'display_role' => $displayRole,
                    'team_membership_role' => $teamMembershipRole,
                    'courier_role' => $courierRole,
                    'vendor_type' => $user->vendor_type,
                    'status' => $user->status,
                    'approved_service_slugs' => $approvedServiceSlugs,
                    'courier_permissions' => $courierPermissions,
                    'superadmin_courier_permissions' => $superAdminCourierPermissions,
                    'has_explicit_superadmin_courier_permissions' => $hasExplicitSuperAdminCourierPermissions,
                    // Only include these when needed - reduces data size
                    'phone' => $user->phone,
                    'image' => $user->image
                        ? asset('storage/' . $user->image) . '?v=' . urlencode((string) optional($user->updated_at)->timestamp)
                        : null,
                    // Note: Removed address, country, date_of_birth from default share
                    // to reduce cookie size. Add them back individually on pages that need them.
                ] : null,
            ],
            // expose Laravel flash messages to the front end
            'flash' => [
                'success' => fn () => $request->session()->pull('success'),
                'error'   => fn () => $request->session()->pull('error'),
                'password_change_required' => fn () => (bool) $request->session()->pull('password_change_required', false),
                'password_change_target' => fn () => $request->session()->pull('password_change_target'),
            ],
        ]);
    }

    private function formatRoleLabel(string $role): string
    {
        $clean = str_replace('courier_', '', strtolower($role));
        return ucwords(str_replace('_', ' ', $clean));
    }
}
