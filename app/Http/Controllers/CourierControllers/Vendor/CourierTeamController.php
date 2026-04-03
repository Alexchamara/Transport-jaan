<?php

namespace App\Http\Controllers\CourierControllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Middleware\CourierTemporaryAccessLifecycle;
use App\Models\Courier\CourierAccessReviewCertification;
use App\Models\Courier\CourierServiceApiCredential;
use App\Models\Courier\CourierSensitiveActionApproval;
use App\Models\Courier\CourierTemporaryAccessGrant;
use App\Models\Courier\VendorCourierSetting;
use App\Models\ServiceWorkspace;
use App\Models\User;
use App\Models\VendorActivityLog;
use App\Models\VendorUserMembership;
use App\Services\Courier\CourierSensitiveActionApprovalService;
use App\Services\Courier\CourierAccessReviewService;
use App\Services\Courier\CourierApiServiceAccessService;
use App\Services\Courier\CourierBreakGlassAlertService;
use App\Services\Courier\CourierSessionSecurityService;
use App\Services\Courier\CourierTeamSecurityAuditService;
use App\Services\Courier\CourierTeamEffectiveAccessService;
use App\Services\Courier\CourierTemporaryAccessService;
use App\Services\Rbac\CourierRoleModelService;
use App\Support\CourierRbac;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class CourierTeamController extends Controller
{
    private const TEAM_SCOPE_LEVELS = [
        'own_records',
        'assigned_region',
        'assigned_hub',
        'all_workspace',
    ];

    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('service.workspace:courier_service');
        $this->middleware(CourierTemporaryAccessLifecycle::class);

        $this->middleware('service.permission:courier.team.view')->only(['index', 'updateAccess']);
        $this->middleware('service.permission:courier.team.create_user')->only(['store']);
        $this->middleware('service.permission:courier.team.manage_status')->only(['bulkUpdate']);
        $this->middleware('service.permission:courier.team.assign_permissions')->only(['updateTeamAccessControlSettings']);
        $this->middleware('service.permission:courier.team.assign_role')->only(['listRoles', 'storeRole', 'storeRoleFromTemplate', 'cloneRole', 'updateRole']);
        $this->middleware('service.permission:courier.team.assign_permissions')->only(['storeRole', 'storeRoleFromTemplate', 'cloneRole', 'updateRole', 'roleVersions']);
        $this->middleware('service.permission:courier.team.assign_permissions')->only(['previewEffectiveAccess']);
        $this->middleware('service.permission:courier.team.sessions.view')->only(['listSessions']);
        $this->middleware('service.permission:courier.team.sessions.revoke')->only(['revokeSession', 'revokeAllSessions']);
        $this->middleware('service.permission:courier.team.transfer_ownership')->only(['transferOwnership']);
        $this->middleware('service.permission:courier.team.assign_permissions')->only(['approveSensitiveApproval', 'rejectSensitiveApproval']);
        $this->middleware('service.permission:courier.team.view')->only(['requestTemporaryAccessElevation']);
        $this->middleware('service.permission:courier.team.assign_permissions')->only(['approveTemporaryAccessElevation', 'rejectTemporaryAccessElevation', 'revokeTemporaryAccessElevation', 'activateBreakGlassAccess']);
        $this->middleware('service.permission:courier.team.access_review.view')->only(['listAccessReviews']);
        $this->middleware('service.permission:courier.team.access_review.certify')->only(['certifyAccessReview']);
        $this->middleware('service.permission:courier.team.api_access.view')->only(['listApiCredentials']);
        $this->middleware('service.permission:courier.team.api_access.manage')->only(['createApiCredential', 'rotateApiCredential', 'revokeApiCredential']);
    }

    public function index(Request $request)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');

        $filters = [
            'memberSearch' => trim((string) $request->query('memberSearch', '')),
            'memberStatus' => trim((string) $request->query('memberStatus', '')),
            'memberPage' => max(1, (int) $request->query('memberPage', 1)),
            'memberPerPage' => max(5, min(50, (int) $request->query('memberPerPage', 10))),
            'activityAction' => trim((string) $request->query('activityAction', '')),
            'activityPage' => max(1, (int) $request->query('activityPage', 1)),
            'activityPerPage' => max(5, min(50, (int) $request->query('activityPerPage', 10))),
        ];

        $membershipsQuery = VendorUserMembership::query()
            ->where('vendor_user_id', $vendorUserId)
            ->with('user:id,name,email,status,role,created_at')
            ->orderByDesc('id');

        if ($filters['memberSearch'] !== '') {
            $search = $filters['memberSearch'];
            $membershipsQuery->whereHas('user', function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        if (in_array($filters['memberStatus'], ['active', 'invited', 'suspended', 'revoked'], true)) {
            $membershipsQuery->where('status', $filters['memberStatus']);
        }

        $summaryQuery = VendorUserMembership::query()
            ->where('vendor_user_id', $vendorUserId);

        $summary = [
            'total' => (int) (clone $summaryQuery)->count(),
            'active' => (int) (clone $summaryQuery)->where('status', 'active')->count(),
            'suspended' => (int) (clone $summaryQuery)->where('status', 'suspended')->count(),
            'owners' => (int) (clone $summaryQuery)->where('membership_role', 'owner')->count(),
        ];

        $memberships = $membershipsQuery->paginate(
            perPage: $filters['memberPerPage'],
            columns: ['*'],
            pageName: 'memberPage',
            page: $filters['memberPage'],
        );

        $registrar = app(PermissionRegistrar::class);
        $registrar->setPermissionsTeamId($workspaceId);

        $rows = $memberships->getCollection()->map(function (VendorUserMembership $membership) {
            $user = $membership->user;

            return [
                'membershipId' => $membership->id,
                'userId' => $user?->id,
                'name' => $user?->name,
                'email' => $user?->email,
                'membershipRole' => $membership->membership_role,
                'status' => $membership->status,
                'blockedServiceKeys' => $membership->blocked_service_keys ?? [],
                'mustChangePassword' => (bool) ($user?->must_change_password ?? false),
                'roles' => $user ? $user->roles->pluck('name')->values() : [],
                'directPermissions' => $user ? $user->permissions->pluck('name')->values() : [],
            ];
        })->values();

        $activityQuery = VendorActivityLog::query()
            ->where('vendor_id', $vendorUserId)
            ->where('action', 'like', 'courier_team_%')
            ->with('admin:id,name,email')
            ->latest('id');

        if ($filters['activityAction'] !== '') {
            $activityQuery->where('action', $filters['activityAction']);
        }

        $activityRows = $activityQuery->paginate(
            perPage: $filters['activityPerPage'],
            columns: ['*'],
            pageName: 'activityPage',
            page: $filters['activityPage'],
        );

        $roleModel = app(CourierRoleModelService::class);
        $roleModel->ensureWorkspaceRoleProfiles($workspaceId, (int) $request->user()->id);
        $workspaceRoles = $roleModel->listWorkspaceRoles($workspaceId);

        $rolePermissionMap = $workspaceRoles
            ->mapWithKeys(function (array $role) {
                return [
                    $role['name'] => collect($role['permissions'] ?? [])->values(),
                ];
            });

        $payload = [
            'members' => $rows,
            'summary' => $summary,
            'memberPagination' => [
                'page' => $memberships->currentPage(),
                'perPage' => $memberships->perPage(),
                'total' => $memberships->total(),
                'totalPages' => $memberships->lastPage(),
            ],
            'roleOptions' => $workspaceRoles->pluck('name')->values(),
            'roleCatalog' => $workspaceRoles,
            'rolePermissionMap' => $rolePermissionMap,
            'permissionOptions' => Permission::query()
                ->where('name', 'like', 'courier.%')
                ->orderBy('name')
                ->pluck('name')
                ->values(),
            'serviceKey' => 'courier_service',
            'teamAccessControl' => $this->readTeamAccessControlSettings($vendorUserId, $workspaceId),
            'accessReviewPolicy' => $this->resolveAccessReviewControlPolicy($vendorUserId),
            'accessReviews' => app(CourierAccessReviewService::class)->listPendingForWorkspace($vendorUserId, $workspaceId),
            'temporaryAccessPolicy' => $this->resolveTemporaryAccessControlPolicy($vendorUserId),
            'temporaryAccessGrants' => $this->listTemporaryAccessGrants($vendorUserId, $workspaceId),
            'roleTemplates' => $roleModel->roleTemplates(),
            'filters' => $filters,
            'capabilities' => [
                'createUser' => $request->user()->can('courier.team.create_user'),
                'assignRole' => $request->user()->can('courier.team.assign_role'),
                'assignPermissions' => $request->user()->can('courier.team.assign_permissions'),
                'manageStatus' => $request->user()->can('courier.team.manage_status'),
                'viewSessions' => $request->user()->can('courier.team.sessions.view'),
                'revokeSessions' => $request->user()->can('courier.team.sessions.revoke'),
                'transferOwnership' => $request->user()->can('courier.team.transfer_ownership'),
            ],
            'activity' => $activityRows->getCollection()
                ->map(function (VendorActivityLog $row) {
                    return [
                        'id' => $row->id,
                        'action' => $row->action,
                        'actorName' => $row->admin?->name,
                        'description' => $row->description,
                        'metadata' => $row->metadata,
                        'createdAt' => optional($row->created_at)->toIso8601String(),
                    ];
                })
                ->values(),
            'activityPagination' => [
                'page' => $activityRows->currentPage(),
                'perPage' => $activityRows->perPage(),
                'total' => $activityRows->total(),
                'totalPages' => $activityRows->lastPage(),
                'actions' => VendorActivityLog::query()
                    ->where('vendor_id', $vendorUserId)
                    ->where('action', 'like', 'courier_team_%')
                    ->distinct()
                    ->pluck('action')
                    ->values(),
            ],
        ];

        if ($request->expectsJson() || $request->boolean('json')) {
            return response()->json($payload);
        }

        return Inertia::render('Web/home/vendors/courierService/Team', [
            'courierTeam' => $payload,
        ]);
    }

    public function store(Request $request)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $actor = $request->user();
        $roleModel = app(CourierRoleModelService::class);
        $roleModel->ensureWorkspaceRoleProfiles($workspaceId, (int) $actor->id);
        $assignableRoleNames = $this->assignableRoleNames($workspaceId);
        $canAssignRole = $actor->can('courier.team.assign_role');
        $canAssignPermissions = $actor->can('courier.team.assign_permissions');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:180'],
            'password' => ['nullable', 'string', 'min:8', 'max:120'],
            'role' => ['nullable', Rule::in($assignableRoleNames)],
            'provisioningBundleKey' => ['nullable', 'string', 'max:120'],
            'directPermissions' => ['nullable', 'array'],
            'directPermissions.*' => ['string', 'max:120'],
            'blockedServiceKeys' => ['nullable', 'array'],
            'blockedServiceKeys.*' => ['string', 'max:80'],
        ]);

        $email = strtolower(trim((string) $validated['email']));

        if (!$canAssignRole) {
            // Create-only operators can create users with least-privilege default role.
            $validated['role'] = in_array('courier_viewer', $assignableRoleNames, true)
                ? 'courier_viewer'
                : ((count($assignableRoleNames) > 0) ? $assignableRoleNames[0] : 'courier_dispatcher');
        }

        if ($canAssignRole && empty($validated['role'])) {
            return back()->with('error', 'Role is required to create a team user.');
        }

        if (!$canAssignPermissions) {
            $validated['directPermissions'] = [];
        }

        $teamAccessControl = $this->readTeamAccessControlSettings($vendorUserId, $workspaceId);
        $bundleByKey = collect($teamAccessControl['onboardingBundles'] ?? [])->keyBy('key');
        $selectedBundle = $bundleByKey->get((string) ($validated['provisioningBundleKey'] ?? ''));

        if ($selectedBundle && $canAssignRole) {
            $validated['role'] = (string) ($selectedBundle['role'] ?? $validated['role']);
        }

        $requestedDirectPermissions = collect($validated['directPermissions'] ?? [])
            ->map(fn ($perm) => (string) $perm);

        $roleDefaultPermissions = collect($teamAccessControl['defaultDirectPermissionsByRole'][$validated['role']] ?? [])
            ->map(fn ($perm) => (string) $perm);

        $bundleDefaultPermissions = collect($selectedBundle['defaultDirectPermissions'] ?? [])
            ->map(fn ($perm) => (string) $perm);

        $validCourierPermissions = Permission::query()
            ->where('name', 'like', 'courier.%')
            ->pluck('name')
            ->map(fn ($perm) => (string) $perm)
            ->values();

        $rawRequestedDirectPermissions = $canAssignPermissions
            ? $requestedDirectPermissions
                ->merge($bundleDefaultPermissions)
                ->merge($roleDefaultPermissions)
                ->filter(fn ($perm) => $validCourierPermissions->contains($perm))
                ->unique()
                ->values()
                ->all()
            : [];

        $effectivePreview = app(CourierTeamEffectiveAccessService::class)->preview(
            $vendorUserId,
            $workspaceId,
            (string) ($validated['role'] ?? ''),
            $rawRequestedDirectPermissions,
        );

        if (($effectivePreview['summary']['deniedCount'] ?? 0) > 0) {
            $firstDenied = $effectivePreview['denied'][0]['explanation'] ?? 'One or more grants are denied by active policy.';
            return back()->with('error', (string) $firstDenied);
        }

        $resolvedDirectPermissions = collect($rawRequestedDirectPermissions)
            ->intersect(collect($effectivePreview['effectivePermissions'] ?? []))
            ->values()
            ->all();

        $effectivePermissions = collect($effectivePreview['effectivePermissions'] ?? [])
            ->filter()
            ->unique()
            ->values()
            ->all();

        $this->validateSodPolicyOrFail($effectivePermissions, $vendorUserId, 'user_assignment');

        $resolvedBlockedServiceKeys = collect($validated['blockedServiceKeys'] ?? [])
            ->merge($selectedBundle['blockedServiceKeys'] ?? [])
            ->map(fn ($serviceKey) => (string) $serviceKey)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $existingMembership = VendorUserMembership::query()
            ->whereHas('user', function ($query) use ($email) {
                $query->where('email', $email);
            })
            ->first();

        if ($existingMembership && (int) $existingMembership->vendor_user_id !== $vendorUserId) {
            return back()->with('error', 'This user already belongs to another vendor.');
        }

        DB::transaction(function () use ($validated, $email, $actor, $vendorUserId, $workspaceId, $resolvedDirectPermissions, $resolvedBlockedServiceKeys, $teamAccessControl, $selectedBundle) {
            $user = User::query()->firstOrCreate(
                ['email' => $email],
                [
                    'name' => (string) $validated['name'],
                    'password' => Hash::make((string) ($validated['password'] ?? env('VENDOR_TEAM_DEFAULT_PASSWORD', 'TempPass@123'))),
                    'role' => 'client',
                    'status' => 'verified',
                    'email_verified_at' => now(),
                    'must_change_password' => true,
                ],
            );

            if (!$user->wasRecentlyCreated && empty($user->password)) {
                $user->update([
                    'password' => Hash::make((string) ($validated['password'] ?? env('VENDOR_TEAM_DEFAULT_PASSWORD', 'TempPass@123'))),
                    'must_change_password' => true,
                ]);
            }

            VendorUserMembership::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'vendor_user_id' => $vendorUserId,
                    'membership_role' => 'member',
                    'status' => 'active',
                    'blocked_service_keys' => $resolvedBlockedServiceKeys,
                    'invited_by_user_id' => $actor->id,
                ],
            );

            $registrar = app(PermissionRegistrar::class);
            $registrar->setPermissionsTeamId($workspaceId);

            $user->syncRoles([$validated['role']]);
            $user->syncPermissions($resolvedDirectPermissions);

            $this->logTeamAction(
                $vendorUserId,
                $actor->id,
                'courier_team_user_created',
                'user',
                $user->id,
                'Courier team user created with role and direct permissions.',
                [
                    'email' => $email,
                    'role' => $validated['role'],
                    'direct_permissions_count' => count($resolvedDirectPermissions),
                    'role_default_permissions_count' => count($teamAccessControl['defaultDirectPermissionsByRole'][$validated['role']] ?? []),
                    'blocked_service_keys' => $resolvedBlockedServiceKeys,
                    'provisioning_bundle_key' => (string) ($selectedBundle['key'] ?? ''),
                    'target_user_id' => (int) $user->id,
                    'before_snapshot' => [
                        'role' => null,
                        'direct_permissions' => [],
                        'status' => null,
                        'blocked_service_keys' => [],
                    ],
                    'after_snapshot' => [
                        'role' => (string) $validated['role'],
                        'direct_permissions' => $resolvedDirectPermissions,
                        'status' => 'active',
                        'blocked_service_keys' => $resolvedBlockedServiceKeys,
                    ],
                ],
            );
        });

        return back()->with('success', 'Courier team user created successfully.');
    }

    public function updateAccess(Request $request, User $user)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $actor = $request->user();
        $roleModel = app(CourierRoleModelService::class);
        $roleModel->ensureWorkspaceRoleProfiles($workspaceId, (int) $actor->id);
        $assignableRoleNames = $this->assignableRoleNames($workspaceId);

        $canAssignRole = $actor->can('courier.team.assign_role');
        $canAssignPermissions = $actor->can('courier.team.assign_permissions');
        $canManageStatus = $actor->can('courier.team.manage_status');
        $teamAccessControl = $this->readTeamAccessControlSettings($vendorUserId, $workspaceId);

        if (!$canAssignRole && !$canAssignPermissions && !$canManageStatus) {
            abort(403, 'You do not have permission to update team access.');
        }

        $membership = VendorUserMembership::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('user_id', $user->id)
            ->first();

        if (!$membership) {
            abort(404, 'Team membership not found.');
        }

        $this->assertCanManageMember($request, $membership, $user);

        $validated = $request->validate([
            'role' => ['nullable', Rule::in($assignableRoleNames)],
            'directPermissions' => ['nullable', 'array'],
            'directPermissions.*' => ['string', 'max:120'],
            'blockedServiceKeys' => ['nullable', 'array'],
            'blockedServiceKeys.*' => ['string', 'max:80'],
            'status' => ['nullable', Rule::in(['active', 'suspended', 'revoked'])],
        ]);

        $currentRole = (string) ($user->roles->pluck('name')->first() ?? '');
        $requestedRole = (string) ($validated['role'] ?? $currentRole);
        $roleChanged = $requestedRole !== '' && $requestedRole !== $currentRole;

        $currentDirectPermissions = $user->permissions->pluck('name')->map(fn ($p) => (string) $p)->sort()->values()->toArray();
        $requestedDirectPermissions = collect($validated['directPermissions'] ?? $currentDirectPermissions)
            ->map(fn ($p) => (string) $p)
            ->sort()
            ->values()
            ->toArray();
        $permissionsChanged = $currentDirectPermissions !== $requestedDirectPermissions;

        $currentBlockedKeys = collect($membership->blocked_service_keys ?? [])->map(fn ($k) => (string) $k)->sort()->values()->toArray();
        $requestedBlockedKeys = collect($validated['blockedServiceKeys'] ?? $membership->blocked_service_keys ?? [])
            ->map(fn ($k) => (string) $k)
            ->sort()
            ->values()
            ->toArray();
        $blockedKeysChanged = $currentBlockedKeys !== $requestedBlockedKeys;

        $statusChanged = !empty($validated['status']) && $validated['status'] !== $membership->status;

        $beforeSnapshot = [
            'role' => $currentRole,
            'direct_permissions' => $currentDirectPermissions,
            'status' => (string) $membership->status,
            'blocked_service_keys' => $currentBlockedKeys,
        ];

        $afterSnapshot = [
            'role' => $requestedRole,
            'direct_permissions' => $permissionsChanged ? $requestedDirectPermissions : $currentDirectPermissions,
            'status' => (string) ($validated['status'] ?? $membership->status),
            'blocked_service_keys' => $blockedKeysChanged ? $requestedBlockedKeys : $currentBlockedKeys,
        ];

        if ($roleChanged && !$canAssignRole) {
            abort(403, 'Missing required permission: courier.team.assign_role');
        }

        if ($permissionsChanged && !$canAssignPermissions) {
            abort(403, 'Missing required permission: courier.team.assign_permissions');
        }

        $resolvedDirectPermissions = $permissionsChanged
            ? collect($validated['directPermissions'] ?? [])->map(fn ($permission) => (string) $permission)->values()->all()
            : $currentDirectPermissions;

        if ($roleChanged || $permissionsChanged) {
            $effectivePreview = app(CourierTeamEffectiveAccessService::class)->preview(
                $vendorUserId,
                $workspaceId,
                $requestedRole,
                $resolvedDirectPermissions,
            );

            if (($effectivePreview['summary']['deniedCount'] ?? 0) > 0) {
                $firstDenied = $effectivePreview['denied'][0]['explanation'] ?? 'One or more grants are denied by active policy.';
                return back()->with('error', (string) $firstDenied);
            }

            $resolvedDirectPermissions = collect($resolvedDirectPermissions)
                ->intersect(collect($effectivePreview['effectivePermissions'] ?? []))
                ->values()
                ->all();

            $afterSnapshot['direct_permissions'] = $resolvedDirectPermissions;

            $this->validateSodPolicyOrFail(
                collect($effectivePreview['effectivePermissions'] ?? [])->values()->all(),
                $vendorUserId,
                'user_assignment'
            );
        }

        if (($statusChanged || $blockedKeysChanged) && !$canManageStatus) {
            abort(403, 'Missing required permission: courier.team.manage_status');
        }

        if ($user->id === $actor->id && in_array(($validated['status'] ?? ''), ['suspended', 'revoked'], true)) {
            return back()->with('error', 'You cannot suspend or revoke your own access.');
        }

        if (
            $membership->membership_role === 'owner'
            && in_array(($validated['status'] ?? ''), ['suspended', 'revoked'], true)
        ) {
            return back()->with('error', 'Owner cannot be suspended or revoked. Transfer ownership first.');
        }

        if (
            $membership->membership_role === 'owner'
            && array_key_exists('blockedServiceKeys', $validated)
            && in_array('courier_service', $validated['blockedServiceKeys'] ?? [], true)
        ) {
            return back()->with('error', 'Owner cannot be blocked from Courier service.');
        }

        DB::transaction(function () use ($validated, $workspaceId, $membership, $user, $request, $roleChanged, $permissionsChanged, $statusChanged, $blockedKeysChanged, $teamAccessControl, $requestedRole, $beforeSnapshot, $afterSnapshot, $resolvedDirectPermissions) {
            if ($blockedKeysChanged) {
                $membership->blocked_service_keys = array_values(array_unique($validated['blockedServiceKeys'] ?? []));
            }

            if ($statusChanged) {
                $membership->status = $validated['status'];
                if ($validated['status'] === 'suspended') {
                    $membership->suspended_at = now();
                    $membership->suspended_by_user_id = $request->user()->id;
                }

                if ($validated['status'] === 'active') {
                    $membership->suspended_at = null;
                    $membership->suspended_by_user_id = null;
                }
            }

            $membership->save();

            $registrar = app(PermissionRegistrar::class);
            $registrar->setPermissionsTeamId($workspaceId);

            if ($roleChanged) {
                $user->syncRoles([$validated['role']]);
            }

            if ($permissionsChanged) {
                $user->syncPermissions(
                    collect($resolvedDirectPermissions)
                        ->filter()
                        ->unique()
                        ->values()
                        ->all()
                );
            }

            if (($validated['status'] ?? '') === 'suspended') {
                DB::table('sessions')
                    ->where('user_id', $user->id)
                    ->delete();
            }

            $this->logTeamAction(
                (int) $membership->vendor_user_id,
                (int) $request->user()->id,
                'courier_team_access_updated',
                'user',
                $user->id,
                'Courier team access updated (role/status/direct permissions/service block).',
                [
                    'role' => $afterSnapshot['role'] ?? null,
                    'status' => $afterSnapshot['status'] ?? null,
                    'direct_permissions_count' => count($afterSnapshot['direct_permissions'] ?? []),
                    'blocked_service_keys' => $afterSnapshot['blocked_service_keys'] ?? null,
                    'target_user_id' => (int) $user->id,
                    'before_snapshot' => $beforeSnapshot,
                    'after_snapshot' => $afterSnapshot,
                ],
            );
        });

        return back()->with('success', 'Team access updated successfully.');
    }

    public function updateTeamAccessControlSettings(Request $request)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $roleModel = app(CourierRoleModelService::class);
        $roleModel->ensureWorkspaceRoleProfiles($workspaceId, (int) $request->user()->id);

        $validCourierPermissions = Permission::query()
            ->where('name', 'like', 'courier.%')
            ->orderBy('name')
            ->pluck('name')
            ->map(fn ($perm) => (string) $perm)
            ->values()
            ->all();

        $validated = $request->validate([
            'defaultDirectPermissionsByRole' => ['nullable', 'array'],
            'defaultDirectPermissionsByRole.*' => ['array'],
            'defaultDirectPermissionsByRole.*.*' => ['string', Rule::in($validCourierPermissions)],
            'defaultDataScopeByRole' => ['nullable', 'array'],
            'defaultDataScopeByRole.*.scope' => ['nullable', 'string', Rule::in(self::TEAM_SCOPE_LEVELS)],
            'defaultDataScopeByRole.*.regionZones' => ['nullable', 'array'],
            'defaultDataScopeByRole.*.regionZones.*' => ['string', 'max:120'],
            'defaultDataScopeByRole.*.hubBranches' => ['nullable', 'array'],
            'defaultDataScopeByRole.*.hubBranches.*' => ['string', 'max:120'],
            'onboardingBundles' => ['nullable', 'array'],
            'onboardingBundles.*.key' => ['required', 'string', 'max:80'],
            'onboardingBundles.*.label' => ['required', 'string', 'max:160'],
            'onboardingBundles.*.role' => ['required', 'string', 'max:120'],
            'onboardingBundles.*.description' => ['nullable', 'string', 'max:240'],
            'onboardingBundles.*.defaultDirectPermissions' => ['nullable', 'array'],
            'onboardingBundles.*.defaultDirectPermissions.*' => ['string', Rule::in($validCourierPermissions)],
            'onboardingBundles.*.blockedServiceKeys' => ['nullable', 'array'],
            'onboardingBundles.*.blockedServiceKeys.*' => ['string', 'max:80'],
        ]);

        $validCourierRoles = $this->workspaceRoleNames($workspaceId);

        $incomingByRole = is_array($validated['defaultDirectPermissionsByRole'] ?? null)
            ? $validated['defaultDirectPermissionsByRole']
            : [];

        $sanitizedByRole = [];
        foreach ($validCourierRoles as $role) {
            $sanitizedByRole[$role] = collect($incomingByRole[$role] ?? [])
                ->map(fn ($perm) => (string) $perm)
                ->filter(fn ($perm) => in_array($perm, $validCourierPermissions, true))
                ->unique()
                ->values()
                ->all();
        }

        foreach ($validCourierRoles as $role) {
            $preview = app(CourierTeamEffectiveAccessService::class)->preview(
                $vendorUserId,
                $workspaceId,
                $role,
                $sanitizedByRole[$role] ?? [],
            );

            if (($preview['summary']['deniedCount'] ?? 0) > 0) {
                $firstDenied = $preview['denied'][0]['explanation'] ?? 'One or more default permissions are denied by active policy.';
                return back()->with('error', "Role {$role}: {$firstDenied}");
            }

            $this->validateSodPolicyOrFail(
                collect($preview['effectivePermissions'] ?? [])->values()->all(),
                $vendorUserId,
                'user_assignment'
            );
        }

        $scopeOptions = $this->resolveScopeOptionsForVendor($vendorUserId);
        $incomingScopeByRole = is_array($validated['defaultDataScopeByRole'] ?? null)
            ? $validated['defaultDataScopeByRole']
            : [];

        $sanitizedScopeByRole = [];
        foreach ($validCourierRoles as $role) {
            $rawScope = is_array($incomingScopeByRole[$role] ?? null) ? $incomingScopeByRole[$role] : [];
            $scope = (string) ($rawScope['scope'] ?? $this->defaultScopeForRole($role));
            if (!in_array($scope, self::TEAM_SCOPE_LEVELS, true)) {
                $scope = $this->defaultScopeForRole($role);
            }

            $sanitizedScopeByRole[$role] = [
                'scope' => $scope,
                'regionZones' => collect($rawScope['regionZones'] ?? [])
                    ->map(fn ($item) => trim((string) $item))
                    ->filter()
                    ->values()
                    ->all(),
                'hubBranches' => collect($rawScope['hubBranches'] ?? [])
                    ->map(fn ($item) => trim((string) $item))
                    ->filter()
                    ->values()
                    ->all(),
            ];
        }

        $rawBundles = is_array($validated['onboardingBundles'] ?? null)
            ? $validated['onboardingBundles']
            : ($this->defaultTeamAccessControlSettings()['onboardingBundles'] ?? []);

        $existingTeamAccessControl = $this->readTeamAccessControlSettings($vendorUserId, $workspaceId);

        $sanitizedBundles = collect($rawBundles)
            ->filter(fn ($bundle) => is_array($bundle))
            ->map(function (array $bundle) use ($validCourierRoles, $validCourierPermissions) {
                $role = (string) ($bundle['role'] ?? '');
                if (!in_array($role, $validCourierRoles, true)) {
                    $role = in_array('courier_dispatcher', $validCourierRoles, true)
                        ? 'courier_dispatcher'
                        : ($validCourierRoles[0] ?? 'courier_viewer');
                }

                return [
                    'key' => Str::slug((string) ($bundle['key'] ?? Str::random(8)), '_'),
                    'label' => trim((string) ($bundle['label'] ?? 'Provisioning Bundle')),
                    'description' => trim((string) ($bundle['description'] ?? '')),
                    'role' => $role,
                    'defaultDirectPermissions' => collect($bundle['defaultDirectPermissions'] ?? [])
                        ->map(fn ($perm) => (string) $perm)
                        ->filter(fn ($perm) => in_array($perm, $validCourierPermissions, true))
                        ->unique()
                        ->values()
                        ->all(),
                    'blockedServiceKeys' => collect($bundle['blockedServiceKeys'] ?? [])
                        ->map(fn ($serviceKey) => trim((string) $serviceKey))
                        ->filter()
                        ->unique()
                        ->values()
                        ->all(),
                ];
            })
            ->unique('key')
            ->values()
            ->all();

        foreach ($sanitizedBundles as $bundle) {
            $bundleRole = (string) ($bundle['role'] ?? '');
            $bundlePermissions = is_array($bundle['defaultDirectPermissions'] ?? null)
                ? $bundle['defaultDirectPermissions']
                : [];

            $preview = app(CourierTeamEffectiveAccessService::class)->preview(
                $vendorUserId,
                $workspaceId,
                $bundleRole,
                $bundlePermissions,
            );

            if (($preview['summary']['deniedCount'] ?? 0) > 0) {
                $firstDenied = $preview['denied'][0]['explanation'] ?? 'One or more bundle permissions are denied by active policy.';
                return back()->with('error', "Bundle {$bundle['label']}: {$firstDenied}");
            }

            $this->validateSodPolicyOrFail(
                collect($preview['effectivePermissions'] ?? [])->values()->all(),
                $vendorUserId,
                'user_assignment'
            );
        }

        $setting = VendorCourierSetting::query()->firstOrCreate(
            ['vendor_user_id' => $vendorUserId],
            ['settings' => []],
        );

        $settings = is_array($setting->settings) ? $setting->settings : [];
        $teamSettings = is_array($settings['team'] ?? null) ? $settings['team'] : [];

        $teamSettings['teamAccessControl'] = [
            'defaultDirectPermissionsByRole' => $sanitizedByRole,
            'defaultDataScopeByRole' => $sanitizedScopeByRole,
            'onboardingBundles' => $sanitizedBundles,
        ];

        $settings['team'] = $teamSettings;

        $setting->update(['settings' => $settings]);

        $this->logTeamAction(
            $vendorUserId,
            (int) $request->user()->id,
            'courier_team_access_control_updated',
            'vendor_team',
            $vendorUserId,
            'Courier team access control defaults updated.',
            [
                'roles_configured_count' => count(array_filter(
                    $settings['team']['teamAccessControl']['defaultDirectPermissionsByRole'],
                    fn ($permissions) => is_array($permissions) && count($permissions) > 0
                )),
                'scope_roles_configured_count' => count(array_filter(
                    $settings['team']['teamAccessControl']['defaultDataScopeByRole'],
                    fn ($scope) => is_array($scope)
                )),
                'bundles_count' => count($settings['team']['teamAccessControl']['onboardingBundles'] ?? []),
                'before_snapshot' => [
                    'team_access_control' => $existingTeamAccessControl,
                ],
                'after_snapshot' => [
                    'team_access_control' => $settings['team']['teamAccessControl'],
                ],
            ],
        );

        return back()->with('success', 'Team access control defaults updated.');
    }

    public function listRoles(Request $request)
    {
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $roleModel = app(CourierRoleModelService::class);
        $roleModel->ensureWorkspaceRoleProfiles($workspaceId, (int) $request->user()->id);

        return response()->json([
            'roles' => $roleModel->listWorkspaceRoles($workspaceId),
            'templates' => $roleModel->roleTemplates(),
            'permissionOptions' => $roleModel->validCourierPermissions(),
        ]);
    }

    public function previewEffectiveAccess(Request $request)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');

        $validated = $request->validate([
            'roleName' => ['required', 'string', Rule::in($this->workspaceRoleNames($workspaceId))],
            'explicitGrants' => ['nullable', 'array'],
            'explicitGrants.*' => ['string', 'max:160'],
            'regionZone' => ['nullable', 'string', 'max:120'],
            'hubBranch' => ['nullable', 'string', 'max:120'],
            'shipmentStage' => ['nullable', 'string', 'max:120'],
            'amount' => ['nullable', 'numeric'],
            'clientTier' => ['nullable', 'string', 'max:120'],
            'slaClass' => ['nullable', 'string', 'max:120'],
        ]);

        $preview = app(CourierTeamEffectiveAccessService::class)->preview(
            $vendorUserId,
            $workspaceId,
            (string) $validated['roleName'],
            is_array($validated['explicitGrants'] ?? null) ? $validated['explicitGrants'] : [],
            [
                'regionZone' => (string) ($validated['regionZone'] ?? ''),
                'hubBranch' => (string) ($validated['hubBranch'] ?? ''),
                'shipmentStage' => (string) ($validated['shipmentStage'] ?? ''),
                'amount' => $validated['amount'] ?? null,
                'clientTier' => (string) ($validated['clientTier'] ?? ''),
                'slaClass' => (string) ($validated['slaClass'] ?? ''),
            ],
        );

        return response()->json($preview);
    }

    public function storeRole(Request $request)
    {
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $roleModel = app(CourierRoleModelService::class);
        $roleModel->ensureWorkspaceRoleProfiles($workspaceId, (int) $request->user()->id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', 'regex:/^[a-zA-Z0-9_\-\s]+$/'],
            'label' => ['required', 'string', 'max:140'],
            'description' => ['nullable', 'string', 'max:1000'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['string', Rule::in($roleModel->validCourierPermissions())],
        ]);

        $this->validateSodPolicyOrFail($validated['permissions'], (int) $request->attributes->get('vendor_user_id'), 'role_edit');

        try {
            $result = $roleModel->createOrUpdateRole($workspaceId, [
                'name' => $validated['name'],
                'label' => $validated['label'],
                'description' => $validated['description'] ?? null,
                'permissions' => $validated['permissions'],
                'sourceType' => 'custom',
            ], $request->user(), null, 'updated');
        } catch (\InvalidArgumentException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        $this->logTeamAction(
            (int) $request->attributes->get('vendor_user_id'),
            (int) $request->user()->id,
            'courier_team_role_created',
            'role',
            0,
            'Courier role created from custom definition.',
            [
                'role_name' => (string) ($result['role']['name'] ?? ''),
                'before_snapshot' => [
                    'role' => null,
                    'permissions' => [],
                ],
                'after_snapshot' => [
                    'role' => (string) ($result['role']['name'] ?? ''),
                    'permissions' => is_array($result['role']['permissions'] ?? null) ? $result['role']['permissions'] : [],
                ],
            ],
        );

        return response()->json($result, 201);
    }

    public function storeRoleFromTemplate(Request $request)
    {
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $roleModel = app(CourierRoleModelService::class);
        $roleModel->ensureWorkspaceRoleProfiles($workspaceId, (int) $request->user()->id);

        $validated = $request->validate([
            'template' => ['required', 'string', Rule::in(array_keys($roleModel->roleTemplates()))],
            'name' => ['required', 'string', 'max:120', 'regex:/^[a-zA-Z0-9_\-\s]+$/'],
            'label' => ['nullable', 'string', 'max:140'],
            'description' => ['nullable', 'string', 'max:1000'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::in($roleModel->validCourierPermissions())],
        ]);

        $templatePermissions = is_array($validated['permissions'] ?? null)
            ? $validated['permissions']
            : (array) ($roleModel->roleTemplates()[(string) $validated['template']]['permissions'] ?? []);

        $this->validateSodPolicyOrFail($templatePermissions, (int) $request->attributes->get('vendor_user_id'), 'role_edit');

        try {
            $result = $roleModel->createRoleFromTemplate($workspaceId, $validated, $request->user());
        } catch (\InvalidArgumentException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        $this->logTeamAction(
            (int) $request->attributes->get('vendor_user_id'),
            (int) $request->user()->id,
            'courier_team_role_created',
            'role',
            0,
            'Courier role created from template.',
            [
                'template' => (string) ($validated['template'] ?? ''),
                'role_name' => (string) ($result['role']['name'] ?? ''),
                'before_snapshot' => [
                    'role' => null,
                    'permissions' => [],
                ],
                'after_snapshot' => [
                    'role' => (string) ($result['role']['name'] ?? ''),
                    'permissions' => is_array($result['role']['permissions'] ?? null) ? $result['role']['permissions'] : [],
                ],
            ],
        );

        return response()->json($result, 201);
    }

    public function cloneRole(Request $request, string $roleName)
    {
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $roleModel = app(CourierRoleModelService::class);
        $roleModel->ensureWorkspaceRoleProfiles($workspaceId, (int) $request->user()->id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', 'regex:/^[a-zA-Z0-9_\-\s]+$/'],
            'label' => ['nullable', 'string', 'max:140'],
            'description' => ['nullable', 'string', 'max:1000'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::in($roleModel->validCourierPermissions())],
        ]);

        $sourceRoleName = Str::lower(trim($roleName));

        $sourceRole = Role::query()
            ->where('service_workspace_id', $workspaceId)
            ->where('name', $sourceRoleName)
            ->where('guard_name', CourierRbac::GUARD)
            ->with('permissions:id,name')
            ->firstOrFail();

        $clonePermissions = is_array($validated['permissions'] ?? null)
            ? $validated['permissions']
            : $sourceRole->permissions->pluck('name')->map(fn ($permission) => (string) $permission)->values()->all();

        $this->validateSodPolicyOrFail($clonePermissions, (int) $request->attributes->get('vendor_user_id'), 'role_edit');

        try {
            $result = $roleModel->cloneRole($workspaceId, $sourceRoleName, $validated, $request->user());
        } catch (\InvalidArgumentException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        $this->logTeamAction(
            (int) $request->attributes->get('vendor_user_id'),
            (int) $request->user()->id,
            'courier_team_role_created',
            'role',
            0,
            'Courier role cloned from existing role.',
            [
                'source_role' => $sourceRoleName,
                'role_name' => (string) ($result['role']['name'] ?? ''),
                'before_snapshot' => [
                    'role' => null,
                    'permissions' => [],
                ],
                'after_snapshot' => [
                    'role' => (string) ($result['role']['name'] ?? ''),
                    'permissions' => is_array($result['role']['permissions'] ?? null) ? $result['role']['permissions'] : [],
                ],
            ],
        );

        return response()->json($result, 201);
    }

    public function updateRole(Request $request, string $roleName)
    {
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $roleModel = app(CourierRoleModelService::class);
        $roleModel->ensureWorkspaceRoleProfiles($workspaceId, (int) $request->user()->id);
        $normalizedRoleName = Str::lower(trim($roleName));

        if ($normalizedRoleName === 'courier_owner') {
            return back()->with('error', 'Owner role cannot be edited.');
        }

        if (!in_array($normalizedRoleName, $this->workspaceRoleNames($workspaceId), true)) {
            abort(404, 'Role not found in this workspace.');
        }

        $existingRole = Role::query()
            ->where('service_workspace_id', $workspaceId)
            ->where('name', $normalizedRoleName)
            ->where('guard_name', CourierRbac::GUARD)
            ->with('permissions:id,name')
            ->first();

        $beforePermissions = $existingRole
            ? $existingRole->permissions->pluck('name')->map(fn ($permission) => (string) $permission)->values()->all()
            : [];

        $validated = $request->validate([
            'label' => ['required', 'string', 'max:140'],
            'description' => ['nullable', 'string', 'max:1000'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['string', Rule::in($roleModel->validCourierPermissions())],
        ]);

        $this->validateSodPolicyOrFail($validated['permissions'], (int) $request->attributes->get('vendor_user_id'), 'role_edit');

        $result = $roleModel->createOrUpdateRole(
            $workspaceId,
            [
                'label' => $validated['label'],
                'description' => $validated['description'] ?? null,
                'permissions' => $validated['permissions'],
            ],
            $request->user(),
            $normalizedRoleName,
            'updated'
        );

        $this->logTeamAction(
            (int) $request->attributes->get('vendor_user_id'),
            (int) $request->user()->id,
            'courier_team_role_updated',
            'role',
            0,
            'Courier role permissions updated.',
            [
                'role_name' => $normalizedRoleName,
                'before_snapshot' => [
                    'role' => $normalizedRoleName,
                    'permissions' => $beforePermissions,
                ],
                'after_snapshot' => [
                    'role' => (string) ($result['role']['name'] ?? $normalizedRoleName),
                    'permissions' => is_array($result['role']['permissions'] ?? null) ? $result['role']['permissions'] : [],
                ],
            ],
        );

        return response()->json($result);
    }

    public function roleVersions(Request $request, string $roleName)
    {
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $roleModel = app(CourierRoleModelService::class);
        $roleModel->ensureWorkspaceRoleProfiles($workspaceId, (int) $request->user()->id);

        return response()->json([
            'role' => Str::lower(trim($roleName)),
            'versions' => $roleModel->roleVersions($workspaceId, Str::lower(trim($roleName))),
        ]);
    }

    public function bulkUpdate(Request $request)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $actor = $request->user();
        $assignableRoleNames = $this->assignableRoleNames($workspaceId);

        $validated = $request->validate([
            'userIds' => ['required', 'array', 'min:1', 'max:200'],
            'userIds.*' => ['required', 'integer'],
            'action' => ['required', Rule::in(['suspend', 'activate', 'revoke_all_sessions', 'assign_role', 'deprovision'])],
            'roleName' => ['nullable', 'string', 'max:120'],
        ]);

        if ($validated['action'] === 'assign_role') {
            if (!$actor->can('courier.team.assign_role') || !$actor->can('courier.team.assign_permissions')) {
                abort(403, 'Missing required team role assignment permissions.');
            }

            if (!in_array((string) ($validated['roleName'] ?? ''), $assignableRoleNames, true)) {
                return back()->with('error', 'A valid role is required for bulk role assignment.');
            }
        }

        if ($validated['action'] === 'deprovision' && !$actor->can('courier.team.manage_status')) {
            abort(403, 'Missing required permission: courier.team.manage_status');
        }

        $teamAccessControl = $this->readTeamAccessControlSettings($vendorUserId, $workspaceId);

        $memberships = VendorUserMembership::query()
            ->where('vendor_user_id', $vendorUserId)
            ->whereIn('user_id', $validated['userIds'])
            ->get()
            ->keyBy('user_id');

        $updated = 0;
        $skipped = 0;

        foreach ($validated['userIds'] as $userId) {
            $membership = $memberships->get((int) $userId);

            if (!$membership) {
                $skipped++;
                continue;
            }

            if ((int) $membership->user_id === (int) $actor->id) {
                $skipped++;
                continue;
            }

            if ($membership->membership_role === 'owner') {
                $skipped++;
                continue;
            }

            if ($validated['action'] === 'suspend') {
                $membership->status = 'suspended';
                $membership->suspended_at = now();
                $membership->suspended_by_user_id = $actor->id;
                $membership->save();
                DB::table('sessions')->where('user_id', $membership->user_id)->delete();
                $updated++;
                continue;
            }

            if ($validated['action'] === 'activate') {
                $membership->status = 'active';
                $membership->suspended_at = null;
                $membership->suspended_by_user_id = null;
                $membership->save();
                $updated++;
                continue;
            }

            if ($validated['action'] === 'revoke_all_sessions') {
                DB::table('sessions')->where('user_id', $membership->user_id)->delete();
                $updated++;
                continue;
            }

            if ($validated['action'] === 'assign_role') {
                $targetUser = User::query()->find((int) $membership->user_id);
                if (!$targetUser) {
                    $skipped++;
                    continue;
                }

                $roleName = (string) ($validated['roleName'] ?? '');
                $roleDefaults = collect($teamAccessControl['defaultDirectPermissionsByRole'][$roleName] ?? [])
                    ->map(fn ($permission) => (string) $permission)
                    ->filter()
                    ->values()
                    ->all();

                $preview = app(CourierTeamEffectiveAccessService::class)->preview(
                    $vendorUserId,
                    $workspaceId,
                    $roleName,
                    $roleDefaults,
                );

                if (($preview['summary']['deniedCount'] ?? 0) > 0) {
                    $skipped++;
                    continue;
                }

                $registrar = app(PermissionRegistrar::class);
                $registrar->setPermissionsTeamId($workspaceId);

                $targetUser->syncRoles([$roleName]);
                $targetUser->syncPermissions($roleDefaults);
                $updated++;
                continue;
            }

            if ($validated['action'] === 'deprovision') {
                $membership->status = 'revoked';
                $membership->blocked_service_keys = array_values(array_unique(array_merge(
                    (array) ($membership->blocked_service_keys ?? []),
                    ['courier_service']
                )));
                $membership->suspended_at = now();
                $membership->suspended_by_user_id = (int) $actor->id;
                $membership->save();

                DB::table('sessions')->where('user_id', $membership->user_id)->delete();

                $targetUser = User::query()->find((int) $membership->user_id);
                if ($targetUser) {
                    $registrar = app(PermissionRegistrar::class);
                    $registrar->setPermissionsTeamId($workspaceId);
                    $targetUser->syncRoles([]);
                    $targetUser->syncPermissions([]);
                }

                $updated++;
            }
        }

        $this->logTeamAction(
            $vendorUserId,
            (int) $actor->id,
            'courier_team_bulk_updated',
            'vendor_team',
            $vendorUserId,
            'Bulk courier team operation applied.',
            [
                'action' => $validated['action'],
                'role_name' => (string) ($validated['roleName'] ?? ''),
                'requested' => count($validated['userIds']),
                'updated' => $updated,
                'skipped' => $skipped,
            ],
        );

        return back()->with('success', "Bulk action completed. Updated {$updated}, skipped {$skipped}.");
    }

    public function listSessions(Request $request, User $user)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');

        $membership = VendorUserMembership::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('user_id', $user->id)
            ->first();

        if (!$membership) {
            abort(404, 'Team membership not found.');
        }

        $this->assertCanManageMember($request, $membership, $user, allowOwnerTarget: true);

        $rows = DB::table('sessions')
            ->where('user_id', $user->id)
            ->orderByDesc('last_activity')
            ->get(['id', 'ip_address', 'user_agent', 'last_activity'])
            ->map(function ($row) {
                return [
                    'id' => (string) $row->id,
                    'ipAddress' => $row->ip_address,
                    'userAgent' => $row->user_agent,
                    'lastActivityAt' => date('Y-m-d H:i:s', (int) $row->last_activity),
                ];
            })
            ->values();

        return response()->json(['sessions' => $rows]);
    }

    public function revokeSession(Request $request, User $user, string $sessionId)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');

        $membership = VendorUserMembership::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('user_id', $user->id)
            ->first();

        if (!$membership) {
            abort(404, 'Team membership not found.');
        }

        $this->assertCanManageMember($request, $membership, $user, allowOwnerTarget: true);

        DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', $sessionId)
            ->delete();

        $this->logTeamAction(
            $vendorUserId,
            (int) $request->user()->id,
            'courier_team_session_revoked',
            'user',
            $user->id,
            'One active team user session revoked.',
            ['session_id' => $sessionId],
        );

        return back()->with('success', 'Session revoked successfully.');
    }

    public function revokeAllSessions(Request $request, User $user)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');

        $membership = VendorUserMembership::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('user_id', $user->id)
            ->first();

        if (!$membership) {
            abort(404, 'Team membership not found.');
        }

        $this->assertCanManageMember($request, $membership, $user, allowOwnerTarget: true);

        DB::table('sessions')
            ->where('user_id', $user->id)
            ->delete();

        $this->logTeamAction(
            $vendorUserId,
            (int) $request->user()->id,
            'courier_team_sessions_revoked_all',
            'user',
            $user->id,
            'All active team user sessions revoked.',
            [],
        );

        return back()->with('success', 'All sessions revoked successfully.');
    }

    public function transferOwnership(Request $request, User $newOwner)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $approvalService = app(CourierSensitiveActionApprovalService::class);
        $approvalPolicy = $this->resolveApprovalControlPolicy($vendorUserId);

        $workspace = ServiceWorkspace::query()
            ->where('id', $workspaceId)
            ->where('vendor_user_id', $vendorUserId)
            ->firstOrFail();

        if ((int) $workspace->owner_user_id !== (int) $request->user()->id) {
            return back()->with('error', 'Only current owner can transfer ownership.');
        }

        if ((int) $workspace->owner_user_id === (int) $newOwner->id) {
            return back()->with('error', 'Selected user is already the owner.');
        }

        $membership = VendorUserMembership::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('user_id', $newOwner->id)
            ->where('status', 'active')
            ->first();

        if (!$membership) {
            abort(422, 'New owner must be an active team member.');
        }

        $approvalGate = $approvalService->ensureApprovedOrQueue(
            $request,
            $vendorUserId,
            $workspaceId,
            $approvalPolicy,
            CourierSensitiveActionApprovalService::ACTION_OWNERSHIP_TRANSFER,
            [
                'resourceType' => 'service_workspace',
                'resourceId' => (int) $workspace->id,
                'subject' => 'ownership_transfer',
                'subjectIds' => [(int) $newOwner->id],
            ]
        );

        if (!(bool) ($approvalGate['ok'] ?? false)) {
            return back()->with('error', (string) ($approvalGate['message'] ?? 'Ownership transfer requires approval.'));
        }

        DB::transaction(function () use ($workspace, $newOwner, $vendorUserId, $workspaceId, $request) {
            $previousOwnerId = (int) $workspace->owner_user_id;

            $workspace->update(['owner_user_id' => $newOwner->id]);

            VendorUserMembership::query()
                ->where('vendor_user_id', $vendorUserId)
                ->where('user_id', $previousOwnerId)
                ->update(['membership_role' => 'admin']);

            VendorUserMembership::query()
                ->where('vendor_user_id', $vendorUserId)
                ->where('user_id', $newOwner->id)
                ->update(['membership_role' => 'owner']);

            $registrar = app(PermissionRegistrar::class);
            $registrar->setPermissionsTeamId($workspaceId);

            User::query()->whereKey($previousOwnerId)->first()?->syncRoles(['courier_admin']);
            $newOwner->syncRoles(['courier_owner']);

            $this->logTeamAction(
                $vendorUserId,
                (int) $request->user()->id,
                'courier_team_ownership_transferred',
                'service_workspace',
                $workspace->id,
                'Courier service ownership transferred to another team member.',
                [
                    'from_user_id' => $previousOwnerId,
                    'to_user_id' => $newOwner->id,
                ],
            );
        });

        if (($approvalGate['approval'] ?? null) instanceof CourierSensitiveActionApproval) {
            $approvalService->markExecuted($approvalGate['approval']);
        }

        return back()->with('success', 'Courier ownership transferred successfully.');
    }

    public function approveSensitiveApproval(Request $request, CourierSensitiveActionApproval $approval)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');

        if ((int) $approval->vendor_user_id !== $vendorUserId) {
            abort(404, 'Approval request not found.');
        }

        if ($approval->service_workspace_id !== null && (int) $approval->service_workspace_id !== $workspaceId) {
            abort(404, 'Approval request not found for this workspace.');
        }

        $service = app(CourierSensitiveActionApprovalService::class);
        $result = $service->approveRequest($request, $approval, $this->resolveApprovalControlPolicy($vendorUserId));

        if (!(bool) ($result['ok'] ?? false)) {
            return response()->json(['message' => (string) ($result['message'] ?? 'Unable to approve request.')], 422);
        }

        $this->logTeamAction(
            $vendorUserId,
            (int) $request->user()->id,
            'courier_team_sensitive_action_approval_approved',
            'sensitive_approval',
            (int) $approval->id,
            'Sensitive action approval decision recorded as approved.',
            [
                'approval_id' => (int) $approval->id,
                'approval_status' => (string) ($result['status'] ?? ''),
                'approved_count' => (int) (($result['approval']->approved_count ?? 0)),
                'required_approvals' => (int) (($result['approval']->required_approvals ?? 0)),
            ],
        );

        return response()->json([
            'message' => (string) ($result['message'] ?? 'Approval recorded.'),
            'status' => (string) ($result['status'] ?? ''),
        ]);
    }

    public function rejectSensitiveApproval(Request $request, CourierSensitiveActionApproval $approval)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');

        if ((int) $approval->vendor_user_id !== $vendorUserId) {
            abort(404, 'Approval request not found.');
        }

        if ($approval->service_workspace_id !== null && (int) $approval->service_workspace_id !== $workspaceId) {
            abort(404, 'Approval request not found for this workspace.');
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $service = app(CourierSensitiveActionApprovalService::class);
        $result = $service->rejectRequest($request, $approval, (string) ($validated['reason'] ?? ''));

        if (!(bool) ($result['ok'] ?? false)) {
            return response()->json(['message' => (string) ($result['message'] ?? 'Unable to reject request.')], 422);
        }

        $this->logTeamAction(
            $vendorUserId,
            (int) $request->user()->id,
            'courier_team_sensitive_action_approval_rejected',
            'sensitive_approval',
            (int) $approval->id,
            'Sensitive action approval request rejected.',
            [
                'approval_id' => (int) $approval->id,
                'reason' => (string) ($validated['reason'] ?? ''),
            ],
        );

        return response()->json([
            'message' => (string) ($result['message'] ?? 'Approval request rejected.'),
            'status' => CourierSensitiveActionApprovalService::STATUS_REJECTED,
        ]);
    }

    public function requestTemporaryAccessElevation(Request $request)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $policy = $this->resolveTemporaryAccessControlPolicy($vendorUserId);

        if (!(bool) ($policy['enabled'] ?? true)) {
            abort(403, 'Temporary access elevation is disabled by policy.');
        }

        $allowedRoles = collect($policy['allowedElevationRoles'] ?? [])->map(fn ($role) => (string) $role)->filter()->values()->all();
        $validated = $request->validate([
            'targetUserId' => ['nullable', 'integer'],
            'ticketRef' => ['required', 'string', 'max:120'],
            'reason' => ['required', 'string', 'max:1000'],
            'elevatedRoleName' => ['nullable', 'string', Rule::in($allowedRoles)],
            'durationMinutes' => ['nullable', 'integer', 'min:15', 'max:' . max(15, (int) ($policy['maxDurationMinutes'] ?? 240))],
        ]);

        $targetUser = $this->resolveTemporaryAccessTargetUser($request, $vendorUserId, (int) ($validated['targetUserId'] ?? 0));
        $ticketRef = trim((string) ($validated['ticketRef'] ?? ''));
        $reason = trim((string) ($validated['reason'] ?? ''));
        $elevatedRoleName = (string) ($validated['elevatedRoleName'] ?? ($allowedRoles[0] ?? 'courier_admin'));
        $durationMinutes = (int) ($validated['durationMinutes'] ?? (int) ($policy['defaultDurationMinutes'] ?? 120));

        $service = app(CourierTemporaryAccessService::class);
        $grant = $service->requestElevation(
            $request,
            $vendorUserId,
            $workspaceId,
            $policy,
            $targetUser,
            $ticketRef,
            $reason,
            $elevatedRoleName,
            $durationMinutes
        );

        $this->logTeamAction(
            $vendorUserId,
            (int) $request->user()->id,
            'courier_team_temp_access_requested',
            'temporary_access',
            (int) $grant->id,
            'Temporary access elevation requested.',
            [
                'target_user_id' => (int) $targetUser->id,
                'ticket_ref' => $ticketRef,
                'duration_minutes' => (int) $grant->duration_minutes,
                'elevated_role_name' => $elevatedRoleName,
            ],
        );

        return response()->json([
            'message' => 'Temporary access request submitted for approval.',
            'grantId' => (int) $grant->id,
            'status' => (string) $grant->status,
        ], 201);
    }

    public function approveTemporaryAccessElevation(Request $request, CourierTemporaryAccessGrant $grant)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');

        if ((int) $grant->vendor_user_id !== $vendorUserId || ($grant->service_workspace_id !== null && (int) $grant->service_workspace_id !== $workspaceId)) {
            abort(404, 'Temporary access request not found.');
        }

        $service = app(CourierTemporaryAccessService::class);
        $result = $service->approveElevation($request, $grant, $workspaceId, $this->resolveTemporaryAccessControlPolicy($vendorUserId));
        if (!(bool) ($result['ok'] ?? false)) {
            return response()->json(['message' => (string) ($result['message'] ?? 'Unable to approve temporary access request.')], 422);
        }

        $this->logTeamAction(
            $vendorUserId,
            (int) $request->user()->id,
            'courier_team_temp_access_approved',
            'temporary_access',
            (int) $grant->id,
            'Temporary access elevation approved and activated.',
            [
                'target_user_id' => (int) ($grant->target_user_id ?? 0),
                'duration_minutes' => (int) ($grant->duration_minutes ?? 0),
                'expires_at' => optional($result['grant']->expires_at ?? null)->toDateTimeString(),
            ],
        );

        return response()->json([
            'message' => (string) ($result['message'] ?? 'Temporary access elevation approved.'),
            'status' => (string) (($result['grant']->status ?? CourierTemporaryAccessService::STATUS_ACTIVE)),
        ]);
    }

    public function rejectTemporaryAccessElevation(Request $request, CourierTemporaryAccessGrant $grant)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');

        if ((int) $grant->vendor_user_id !== $vendorUserId || ($grant->service_workspace_id !== null && (int) $grant->service_workspace_id !== $workspaceId)) {
            abort(404, 'Temporary access request not found.');
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $service = app(CourierTemporaryAccessService::class);
        $result = $service->rejectElevation($request, $grant, (string) ($validated['reason'] ?? ''));
        if (!(bool) ($result['ok'] ?? false)) {
            return response()->json(['message' => (string) ($result['message'] ?? 'Unable to reject temporary access request.')], 422);
        }

        $this->logTeamAction(
            $vendorUserId,
            (int) $request->user()->id,
            'courier_team_temp_access_rejected',
            'temporary_access',
            (int) $grant->id,
            'Temporary access elevation request rejected.',
            [
                'target_user_id' => (int) ($grant->target_user_id ?? 0),
                'reason' => (string) ($validated['reason'] ?? ''),
            ],
        );

        return response()->json([
            'message' => (string) ($result['message'] ?? 'Temporary access request rejected.'),
            'status' => CourierTemporaryAccessService::STATUS_REJECTED,
        ]);
    }

    public function revokeTemporaryAccessElevation(Request $request, CourierTemporaryAccessGrant $grant)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');

        if ((int) $grant->vendor_user_id !== $vendorUserId || ($grant->service_workspace_id !== null && (int) $grant->service_workspace_id !== $workspaceId)) {
            abort(404, 'Temporary access grant not found.');
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        app(CourierTemporaryAccessService::class)->revokeGrant(
            $grant,
            $workspaceId,
            (int) optional($request->user())->id,
            (string) ($validated['reason'] ?? 'Manual revoke by authorized approver.')
        );

        $this->logTeamAction(
            $vendorUserId,
            (int) $request->user()->id,
            'courier_team_temp_access_revoked',
            'temporary_access',
            (int) $grant->id,
            'Temporary access grant revoked.',
            [
                'target_user_id' => (int) ($grant->target_user_id ?? 0),
                'reason' => (string) ($validated['reason'] ?? ''),
            ],
        );

        return response()->json([
            'message' => 'Temporary access grant revoked successfully.',
            'status' => CourierTemporaryAccessService::STATUS_REVOKED,
        ]);
    }

    public function activateBreakGlassAccess(Request $request)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $policy = $this->resolveTemporaryAccessControlPolicy($vendorUserId);
        $bgPolicy = is_array($policy['breakGlass'] ?? null) ? $policy['breakGlass'] : [];

        if (!(bool) ($bgPolicy['enabled'] ?? false)) {
            abort(403, 'Break-glass emergency access is disabled by policy.');
        }

        $validated = $request->validate([
            'targetUserId' => ['nullable', 'integer'],
            'ticketRef' => ['required', 'string', 'max:120'],
            'reason' => ['required', 'string', 'max:1000'],
            'durationMinutes' => ['nullable', 'integer', 'min:10', 'max:' . max(10, (int) ($bgPolicy['maxDurationMinutes'] ?? 60))],
        ]);

        $targetUser = $this->resolveTemporaryAccessTargetUser($request, $vendorUserId, (int) ($validated['targetUserId'] ?? 0));

        $result = app(CourierTemporaryAccessService::class)->activateBreakGlass(
            $request,
            $vendorUserId,
            $workspaceId,
            $policy,
            $targetUser,
            (string) ($validated['ticketRef'] ?? ''),
            (string) ($validated['reason'] ?? ''),
            (int) ($validated['durationMinutes'] ?? (int) ($bgPolicy['defaultDurationMinutes'] ?? 30))
        );

        if (!(bool) ($result['ok'] ?? false)) {
            return response()->json(['message' => (string) ($result['message'] ?? 'Unable to activate break-glass access.')], 422);
        }

        $grant = $result['grant'] ?? null;
        $alertContext = [
            'vendor_user_id' => $vendorUserId,
            'workspace_id' => $workspaceId,
            'target_user_id' => (int) $targetUser->id,
            'grant_id' => (int) ($grant?->id ?? 0),
            'ticket_ref' => (string) ($validated['ticketRef'] ?? ''),
            'duration_minutes' => (int) ($grant?->duration_minutes ?? 0),
            'expires_at' => optional($grant?->expires_at)->toDateTimeString(),
        ];

        Log::warning('COURIER BREAK GLASS ACTIVATED', $alertContext);

        $delivery = app(CourierBreakGlassAlertService::class)->dispatchActivatedAlerts(
            $vendorUserId,
            $workspaceId,
            $policy,
            $grant,
            $request->user(),
            $targetUser,
        );

        $this->logTeamAction(
            $vendorUserId,
            (int) $request->user()->id,
            'courier_team_break_glass_activated',
            'temporary_access',
            (int) ($grant?->id ?? 0),
            'Break-glass emergency access activated.',
            array_merge($alertContext, [
                'reason' => (string) ($validated['reason'] ?? ''),
                'alert_delivery' => $delivery,
            ]),
        );

        return response()->json([
            'message' => (string) ($result['message'] ?? 'Break-glass access activated.'),
            'status' => (string) ($grant?->status ?? CourierTemporaryAccessService::STATUS_ACTIVE),
        ], 201);
    }

    public function sessionSecurityStatus(Request $request)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $actor = $request->user();
        $service = app(CourierSessionSecurityService::class);

        return response()->json([
            'policy' => $service->resolvePolicyForVendor($vendorUserId),
            'trustedDevices' => $service->trustedDevicesForActor($vendorUserId, $workspaceId, (int) optional($actor)->id),
            'stepUpVerifiedAt' => (string) $request->session()->get('courier_security.step_up_verified_at', ''),
            'twoFactorVerifiedAt' => (string) $request->session()->get('courier_security.two_factor_verified_at', ''),
            'anomalyDetectedAt' => (string) $request->session()->get('courier_security.anomaly_detected_at', ''),
        ]);
    }

    public function requestStepUpVerification(Request $request)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $actor = $request->user();

        if (!$actor) {
            abort(401, 'Authentication required.');
        }

        $code = (string) random_int(100000, 999999);
        $challenge = [
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(10)->format('Y-m-d H:i:s'),
            'attempts' => 0,
            'max_attempts' => 5,
            'sent_to' => (string) ($actor->email ?? ''),
        ];

        $request->session()->put('courier_security.challenge', $challenge);

        try {
            Mail::raw(
                "Courier step-up verification code: {$code}\nThis code expires in 10 minutes.",
                function ($message) use ($actor) {
                    $message->to((string) $actor->email)
                        ->subject('[Courier] Step-up verification code');
                }
            );
        } catch (\Throwable $exception) {
            Log::warning('Failed to send courier step-up verification email.', [
                'vendor_user_id' => $vendorUserId,
                'user_id' => (int) $actor->id,
                'error' => $exception->getMessage(),
            ]);

            $request->session()->forget('courier_security.challenge');

            return response()->json([
                'message' => 'Unable to send OTP email right now. Please try again.',
            ], 503);
        }

        $this->logTeamAction(
            $vendorUserId,
            (int) $actor->id,
            'courier_team_security_stepup_requested',
            'security',
            0,
            'Step-up verification challenge requested.',
            ['channel' => 'email'],
        );

        return response()->json(['message' => 'Step-up verification code issued. Check your email inbox.']);
    }

    public function verifyStepUpVerification(Request $request)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $actor = $request->user();

        if (!$actor) {
            abort(401, 'Authentication required.');
        }

        $validated = $request->validate([
            'currentPassword' => ['required', 'string', 'min:8'],
            'otpCode' => ['required', 'string', 'size:6'],
        ]);

        $challenge = $request->session()->get('courier_security.challenge', []);
        if (!is_array($challenge) || empty($challenge['code_hash']) || empty($challenge['expires_at'])) {
            app(CourierTeamSecurityAuditService::class)->recordAuthChallengeFailure(
                $request,
                'challenge_not_found'
            );
            return response()->json(['message' => 'Step-up challenge not found. Request a new verification code.'], 422);
        }

        $challengeExpiresAt = \Illuminate\Support\Carbon::parse((string) $challenge['expires_at']);
        if (now()->gt($challengeExpiresAt)) {
            $request->session()->forget('courier_security.challenge');
            app(CourierTeamSecurityAuditService::class)->recordAuthChallengeFailure(
                $request,
                'challenge_expired'
            );
            return response()->json(['message' => 'Step-up challenge expired. Request a new verification code.'], 422);
        }

        $attempts = (int) ($challenge['attempts'] ?? 0);
        $maxAttempts = max(1, (int) ($challenge['max_attempts'] ?? 5));
        if ($attempts >= $maxAttempts) {
            $request->session()->forget('courier_security.challenge');
            app(CourierTeamSecurityAuditService::class)->recordAuthChallengeFailure(
                $request,
                'challenge_attempts_exhausted'
            );
            return response()->json(['message' => 'Maximum verification attempts exceeded. Request a new code.'], 422);
        }

        if (!Hash::check((string) $validated['currentPassword'], (string) ($actor->password ?? ''))) {
            app(CourierTeamSecurityAuditService::class)->recordAuthChallengeFailure(
                $request,
                'invalid_current_password'
            );
            return response()->json(['message' => 'Current password is invalid.'], 422);
        }

        if (!Hash::check((string) $validated['otpCode'], (string) $challenge['code_hash'])) {
            $challenge['attempts'] = $attempts + 1;
            $request->session()->put('courier_security.challenge', $challenge);
            app(CourierTeamSecurityAuditService::class)->recordAuthChallengeFailure(
                $request,
                'invalid_otp_code',
                ['attempts' => (int) $challenge['attempts'], 'max_attempts' => $maxAttempts]
            );
            return response()->json(['message' => 'Verification code is invalid.'], 422);
        }

        $now = now()->format('Y-m-d H:i:s');
        $request->session()->put('courier_security.step_up_verified_at', $now);
        $request->session()->put('courier_security.two_factor_verified_at', $now);
        $request->session()->forget('courier_security.challenge');
        $request->session()->forget('courier_security.anomaly_detected_at');

        $this->logTeamAction(
            $vendorUserId,
            (int) $actor->id,
            'courier_team_security_stepup_verified',
            'security',
            0,
            'Step-up verification completed successfully.',
            [],
        );

        return response()->json(['message' => 'Step-up verification completed successfully.']);
    }

    public function trustCurrentDevice(Request $request)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $actor = $request->user();

        if (!$actor) {
            abort(401, 'Authentication required.');
        }

        $validated = $request->validate([
            'label' => ['nullable', 'string', 'max:140'],
        ]);

        $device = app(CourierSessionSecurityService::class)->trustCurrentDevice(
            $request,
            $vendorUserId,
            $workspaceId,
            (string) ($validated['label'] ?? 'Current Device')
        );

        $this->logTeamAction(
            $vendorUserId,
            (int) $actor->id,
            'courier_team_security_device_trusted',
            'security',
            (int) $device->id,
            'Current device marked as trusted.',
            [
                'device_label' => (string) ($device->device_label ?? ''),
                'expires_at' => optional($device->expires_at)->toDateTimeString(),
            ],
        );

        return response()->json([
            'message' => 'Current device is now trusted.',
            'device' => [
                'id' => (int) $device->id,
                'label' => (string) ($device->device_label ?? ''),
                'expiresAt' => optional($device->expires_at)->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    public function listAccessReviews(Request $request)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');

        return response()->json([
            'policy' => $this->resolveAccessReviewControlPolicy($vendorUserId),
            'reviews' => app(CourierAccessReviewService::class)->listPendingForWorkspace($vendorUserId, $workspaceId),
        ]);
    }

    public function certifyAccessReview(Request $request, CourierAccessReviewCertification $review)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $actor = $request->user();

        if ((int) $review->vendor_user_id !== $vendorUserId
            || ($review->service_workspace_id !== null && (int) $review->service_workspace_id !== $workspaceId)) {
            abort(404, 'Access review item not found.');
        }

        $targetUser = User::query()->findOrFail((int) $review->subject_user_id);
        $targetMembership = VendorUserMembership::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('user_id', (int) $review->subject_user_id)
            ->firstOrFail();

        $this->assertCanManageMember($request, $targetMembership, $targetUser, allowOwnerTarget: false);

        $validated = $request->validate([
            'keepAccess' => ['required', 'boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $result = app(CourierAccessReviewService::class)->certify(
            $review,
            (int) $actor->id,
            (bool) $validated['keepAccess'],
            (string) ($validated['notes'] ?? '')
        );

        if (!(bool) ($result['ok'] ?? false)) {
            return response()->json(['message' => (string) ($result['message'] ?? 'Unable to process access review certification.')], 422);
        }

        $this->logTeamAction(
            $vendorUserId,
            (int) $actor->id,
            'courier_team_access_review_certified',
            'access_review',
            (int) $review->id,
            (bool) $validated['keepAccess']
                ? 'Access review certified and access retained.'
                : 'Access review certified and access revoked.',
            [
                'subject_user_id' => (int) $review->subject_user_id,
                'status' => (string) ($result['status'] ?? ''),
            ],
        );

        return response()->json([
            'message' => (string) ($result['message'] ?? 'Access review processed successfully.'),
            'status' => (string) ($result['status'] ?? ''),
        ]);
    }

    public function listApiCredentials(Request $request)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $service = app(CourierApiServiceAccessService::class);

        return response()->json([
            'policy' => $service->resolvePolicyForVendor($vendorUserId),
            'scopeOptions' => $service->apiScopeCatalog(),
            'credentials' => $service->listCredentials($vendorUserId, $workspaceId),
        ]);
    }

    public function createApiCredential(Request $request)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $service = app(CourierApiServiceAccessService::class);

        $validated = $request->validate([
            'credentialName' => ['required', 'string', 'max:160'],
            'serviceAccountCode' => ['nullable', 'string', 'max:80'],
            'roleName' => ['required', 'string', Rule::in($this->workspaceRoleNames($workspaceId))],
            'permissionScopes' => ['required', 'array', 'min:1'],
            'permissionScopes.*' => ['string', Rule::in($service->apiScopeCatalog())],
            'webhookScopes' => ['nullable', 'array'],
            'webhookScopes.*' => ['string', 'max:120'],
            'ttlDays' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        try {
            $result = $service->createCredential(
                $request,
                $vendorUserId,
                $workspaceId,
                (int) $request->user()->id,
                $validated
            );
        } catch (\RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Service API credential created successfully.',
            'credential' => $result['credential'],
            'plainApiKey' => (string) ($result['plainApiKey'] ?? ''),
        ], 201);
    }

    public function rotateApiCredential(Request $request, CourierServiceApiCredential $credential)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');

        if ((int) $credential->vendor_user_id !== $vendorUserId || (int) $credential->service_workspace_id !== $workspaceId) {
            abort(404, 'API credential not found.');
        }

        $validated = $request->validate([
            'ttlDays' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        try {
            $result = app(CourierApiServiceAccessService::class)->rotateCredential(
                $request,
                $credential,
                (int) $request->user()->id,
                array_key_exists('ttlDays', $validated) ? (int) $validated['ttlDays'] : null
            );
        } catch (\RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json([
            'message' => 'API credential rotated successfully.',
            'credential' => $result['credential'],
            'plainApiKey' => (string) ($result['plainApiKey'] ?? ''),
        ]);
    }

    public function revokeApiCredential(Request $request, CourierServiceApiCredential $credential)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');

        if ((int) $credential->vendor_user_id !== $vendorUserId || (int) $credential->service_workspace_id !== $workspaceId) {
            abort(404, 'API credential not found.');
        }

        app(CourierApiServiceAccessService::class)->revokeCredential($credential, (int) $request->user()->id);

        return response()->json([
            'message' => 'API credential revoked successfully.',
        ]);
    }

    private function assertCanManageMember(
        Request $request,
        VendorUserMembership $targetMembership,
        User $targetUser,
        bool $allowOwnerTarget = false,
    ): void {
        $actor = $request->user();
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');

        if ((int) $actor->id === $vendorUserId) {
            return;
        }

        $actorMembership = VendorUserMembership::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('user_id', $actor->id)
            ->where('status', 'active')
            ->first();

        if (!$actorMembership) {
            abort(403, 'Active team membership is required.');
        }

        if ($targetMembership->membership_role === 'owner' && !$allowOwnerTarget) {
            abort(403, 'Owner access can only be changed through ownership transfer.');
        }

        $rank = [
            'member' => 1,
            'admin' => 2,
            'owner' => 3,
        ];

        $actorRank = $rank[$actorMembership->membership_role] ?? 0;
        $targetRank = $rank[$targetMembership->membership_role] ?? 0;

        if ($actorRank <= $targetRank) {
            abort(403, 'You can only manage team users below your membership level.');
        }

        if ($targetUser->id === $actor->id) {
            abort(403, 'You cannot apply this operation to your own account.');
        }
    }

    private function logTeamAction(
        int $vendorUserId,
        int $actorUserId,
        string $action,
        string $targetType,
        int $targetId,
        string $description,
        array $metadata = [],
    ): void {
        VendorActivityLog::query()->create([
            'vendor_id' => $vendorUserId,
            'admin_id' => $actorUserId,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'description' => $description,
            'metadata' => $metadata,
        ]);

        try {
            app(CourierTeamSecurityAuditService::class)->recordFromTeamAction(
                request(),
                $action,
                $targetType,
                $targetId,
                is_array($metadata) ? $metadata : []
            );
        } catch (\Throwable) {
            // Immutable audit logging should not break business flows.
        }
    }

    private function defaultTeamAccessControlSettings(): array
    {
        return [
            'defaultDirectPermissionsByRole' => [],
            'defaultDataScopeByRole' => [],
            'onboardingBundles' => [
                [
                    'key' => 'dispatcher_colombo_hub',
                    'label' => 'Dispatcher - Colombo Hub',
                    'description' => 'Dispatcher profile with operational defaults for Colombo hub workflows.',
                    'role' => 'courier_dispatcher',
                    'defaultDirectPermissions' => [],
                    'blockedServiceKeys' => [],
                ],
                [
                    'key' => 'support_global_read_exceptions',
                    'label' => 'Support - Global Read + Exceptions',
                    'description' => 'Support profile focused on global visibility and exception handling.',
                    'role' => 'courier_support',
                    'defaultDirectPermissions' => [
                        'courier.tracking.view',
                        'courier.clients.manage',
                    ],
                    'blockedServiceKeys' => [],
                ],
            ],
        ];
    }

    private function readTeamAccessControlSettings(int $vendorUserId, ?int $workspaceId = null): array
    {
        $record = VendorCourierSetting::query()->firstWhere('vendor_user_id', $vendorUserId);
        $settings = is_array($record?->settings) ? $record->settings : [];
        $defaults = $this->defaultTeamAccessControlSettings();

        $teamSettings = is_array($settings['team'] ?? null) ? $settings['team'] : [];

        $current = is_array($teamSettings['teamAccessControl'] ?? null)
            ? $teamSettings['teamAccessControl']
            : (is_array($settings['teamAccessControl'] ?? null) ? $settings['teamAccessControl'] : []);

        $validCourierRoles = $workspaceId ? $this->workspaceRoleNames($workspaceId) : Role::query()
            ->where('name', 'like', 'courier_%')
            ->pluck('name')
            ->map(fn ($role) => (string) $role)
            ->values()
            ->all();

        $rawByRole = is_array($current['defaultDirectPermissionsByRole'] ?? null)
            ? $current['defaultDirectPermissionsByRole']
            : [];

        $rawScopeByRole = is_array($current['defaultDataScopeByRole'] ?? null)
            ? $current['defaultDataScopeByRole']
            : [];

        $scopeOptions = $this->resolveScopeOptionsForVendor($vendorUserId);

        $normalizedByRole = [];
        $normalizedScopeByRole = [];
        foreach ($validCourierRoles as $role) {
            $normalizedByRole[$role] = collect($rawByRole[$role] ?? [])
                ->map(fn ($perm) => (string) $perm)
                ->filter(fn ($perm) => $perm !== '')
                ->unique()
                ->values()
                ->all();

            $rolePolicy = is_array($teamSettings['permissionModel']['rolePolicies'][$role] ?? null)
                ? $teamSettings['permissionModel']['rolePolicies'][$role]
                : [];

            $roleConstraints = is_array($rolePolicy['constraints'] ?? null) ? $rolePolicy['constraints'] : [];
            $roleScopeSource = is_array($rawScopeByRole[$role] ?? null) ? $rawScopeByRole[$role] : [];

            $scope = (string) ($roleScopeSource['scope'] ?? $rolePolicy['scope'] ?? $this->defaultScopeForRole($role));
            if (!in_array($scope, self::TEAM_SCOPE_LEVELS, true)) {
                $scope = $this->defaultScopeForRole($role);
            }

            $normalizedScopeByRole[$role] = [
                'scope' => $scope,
                'regionZones' => collect($roleScopeSource['regionZones'] ?? $roleConstraints['regionZones'] ?? [])
                    ->map(fn ($item) => trim((string) $item))
                    ->filter()
                    ->values()
                    ->all(),
                'hubBranches' => collect($roleScopeSource['hubBranches'] ?? $roleConstraints['hubBranches'] ?? [])
                    ->map(fn ($item) => trim((string) $item))
                    ->filter()
                    ->values()
                    ->all(),
            ];
        }

        $validCourierPermissions = Permission::query()
            ->where('name', 'like', 'courier.%')
            ->pluck('name')
            ->map(fn ($perm) => (string) $perm)
            ->values()
            ->all();

        $rawBundles = is_array($current['onboardingBundles'] ?? null)
            ? $current['onboardingBundles']
            : ($defaults['onboardingBundles'] ?? []);

        $normalizedBundles = collect($rawBundles)
            ->filter(fn ($bundle) => is_array($bundle))
            ->map(function (array $bundle) use ($validCourierRoles, $validCourierPermissions) {
                $role = (string) ($bundle['role'] ?? '');
                if (!in_array($role, $validCourierRoles, true)) {
                    $role = in_array('courier_dispatcher', $validCourierRoles, true)
                        ? 'courier_dispatcher'
                        : ($validCourierRoles[0] ?? 'courier_viewer');
                }

                return [
                    'key' => Str::slug((string) ($bundle['key'] ?? Str::random(8)), '_'),
                    'label' => trim((string) ($bundle['label'] ?? 'Provisioning Bundle')),
                    'description' => trim((string) ($bundle['description'] ?? '')),
                    'role' => $role,
                    'defaultDirectPermissions' => collect($bundle['defaultDirectPermissions'] ?? [])
                        ->map(fn ($perm) => (string) $perm)
                        ->filter(fn ($perm) => in_array($perm, $validCourierPermissions, true))
                        ->unique()
                        ->values()
                        ->all(),
                    'blockedServiceKeys' => collect($bundle['blockedServiceKeys'] ?? [])
                        ->map(fn ($serviceKey) => trim((string) $serviceKey))
                        ->filter()
                        ->unique()
                        ->values()
                        ->all(),
                ];
            })
            ->unique('key')
            ->values()
            ->all();

        return [
            'defaultDirectPermissionsByRole' => $normalizedByRole,
            'defaultDataScopeByRole' => $normalizedScopeByRole,
            'onboardingBundles' => $normalizedBundles,
            'scopeLevels' => self::TEAM_SCOPE_LEVELS,
            'scopeOptions' => $scopeOptions,
        ];
    }

    private function resolveScopeOptionsForVendor(int $vendorUserId): array
    {
        $record = VendorCourierSetting::query()->firstWhere('vendor_user_id', $vendorUserId);
        $settings = is_array($record?->settings) ? $record->settings : [];
        $business = is_array($settings['business'] ?? null) ? $settings['business'] : [];

        $availableZones = collect(explode(',', (string) ($business['serviceZones'] ?? '')))
            ->map(fn ($item) => trim((string) $item))
            ->filter()
            ->unique()
            ->values()
            ->all();

        $availableHubs = collect([(string) ($business['primaryHub'] ?? '')])
            ->map(fn ($item) => trim((string) $item))
            ->filter()
            ->unique()
            ->values()
            ->all();

        return [
            'availableZones' => $availableZones,
            'availableHubs' => $availableHubs,
        ];
    }

    private function defaultScopeForRole(string $role): string
    {
        return match ($role) {
            'courier_owner', 'courier_admin', 'courier_finance' => 'all_workspace',
            'courier_dispatcher' => 'assigned_hub',
            'courier_tracking_officer', 'courier_viewer' => 'assigned_region',
            default => 'own_records',
        };
    }

    private function workspaceRoleNames(int $workspaceId): array
    {
        return Role::query()
            ->where('service_workspace_id', $workspaceId)
            ->where('guard_name', CourierRbac::GUARD)
            ->where('name', 'like', 'courier_%')
            ->pluck('name')
            ->map(fn ($role) => (string) $role)
            ->values()
            ->all();
    }

    private function resolveApprovalControlPolicy(int $vendorUserId): array
    {
        $record = VendorCourierSetting::query()->firstWhere('vendor_user_id', $vendorUserId);
        $settings = is_array($record?->settings) ? $record->settings : [];
        $team = is_array($settings['team'] ?? null) ? $settings['team'] : [];
        $approvalControl = is_array($team['approvalControl'] ?? null) ? $team['approvalControl'] : [];

        return app(CourierSensitiveActionApprovalService::class)->normalizePolicy($approvalControl);
    }

    private function resolveTemporaryAccessControlPolicy(int $vendorUserId): array
    {
        $record = VendorCourierSetting::query()->firstWhere('vendor_user_id', $vendorUserId);
        $settings = is_array($record?->settings) ? $record->settings : [];
        $team = is_array($settings['team'] ?? null) ? $settings['team'] : [];
        $temporaryAccessControl = is_array($team['temporaryAccessControl'] ?? null) ? $team['temporaryAccessControl'] : [];

        return app(CourierTemporaryAccessService::class)->normalizePolicy($temporaryAccessControl);
    }

    private function resolveAccessReviewControlPolicy(int $vendorUserId): array
    {
        $record = VendorCourierSetting::query()->firstWhere('vendor_user_id', $vendorUserId);
        $settings = is_array($record?->settings) ? $record->settings : [];
        $team = is_array($settings['team'] ?? null) ? $settings['team'] : [];
        $accessReviewControl = is_array($team['accessReviewControl'] ?? null) ? $team['accessReviewControl'] : [];

        return app(CourierAccessReviewService::class)->normalizePolicy($accessReviewControl);
    }

    private function listTemporaryAccessGrants(int $vendorUserId, int $workspaceId): array
    {
        return CourierTemporaryAccessGrant::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where(function ($query) use ($workspaceId) {
                $query->whereNull('service_workspace_id')
                    ->orWhere('service_workspace_id', $workspaceId);
            })
            ->whereIn('status', [
                CourierTemporaryAccessService::STATUS_PENDING,
                CourierTemporaryAccessService::STATUS_ACTIVE,
            ])
            ->with(['requester:id,name,email', 'approver:id,name,email', 'targetUser:id,name,email'])
            ->orderByDesc('id')
            ->limit(120)
            ->get()
            ->map(function (CourierTemporaryAccessGrant $grant) {
                return [
                    'id' => (int) $grant->id,
                    'grantType' => (string) $grant->grant_type,
                    'status' => (string) $grant->status,
                    'elevatedRoleName' => (string) $grant->elevated_role_name,
                    'ticketRef' => (string) $grant->ticket_ref,
                    'reason' => (string) $grant->reason,
                    'durationMinutes' => (int) $grant->duration_minutes,
                    'startsAt' => optional($grant->starts_at)->format('Y-m-d H:i:s'),
                    'expiresAt' => optional($grant->expires_at)->format('Y-m-d H:i:s'),
                    'createdAt' => optional($grant->created_at)->format('Y-m-d H:i:s'),
                    'targetUser' => [
                        'id' => (int) ($grant->targetUser?->id ?? 0),
                        'name' => (string) ($grant->targetUser?->name ?? ''),
                        'email' => (string) ($grant->targetUser?->email ?? ''),
                    ],
                    'requester' => [
                        'id' => (int) ($grant->requester?->id ?? 0),
                        'name' => (string) ($grant->requester?->name ?? ''),
                        'email' => (string) ($grant->requester?->email ?? ''),
                    ],
                    'approver' => [
                        'id' => (int) ($grant->approver?->id ?? 0),
                        'name' => (string) ($grant->approver?->name ?? ''),
                        'email' => (string) ($grant->approver?->email ?? ''),
                    ],
                ];
            })
            ->values()
            ->all();
    }

    private function resolveTemporaryAccessTargetUser(Request $request, int $vendorUserId, int $targetUserId = 0): User
    {
        $resolvedTargetUserId = $targetUserId > 0 ? $targetUserId : (int) optional($request->user())->id;
        $targetUser = User::query()->findOrFail($resolvedTargetUserId);

        $membership = VendorUserMembership::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('user_id', $resolvedTargetUserId)
            ->where('status', 'active')
            ->first();

        if (!$membership) {
            abort(422, 'Target user must be an active team member.');
        }

        return $targetUser;
    }

    private function defaultSodControlPolicy(): array
    {
        return [
            'enabled' => true,
            'toxicCombinations' => [
                [
                    'key' => 'refund_create_and_approve',
                    'label' => 'Cannot both create refunds and approve refunds',
                    'permissions' => ['courier.refunds.create', 'courier.refunds.approve'],
                    'enforceRoleEdit' => true,
                    'enforceUserAssignment' => true,
                    'enabled' => true,
                ],
                [
                    'key' => 'assign_permissions_and_approve_access_request',
                    'label' => 'Cannot both assign permissions and approve access requests',
                    'permissions' => ['courier.team.assign_permissions', 'courier.team.access_requests.approve'],
                    'enforceRoleEdit' => true,
                    'enforceUserAssignment' => true,
                    'enabled' => true,
                ],
            ],
        ];
    }

    private function normalizeSodControlPolicy(array $policy): array
    {
        $defaults = $this->defaultSodControlPolicy();
        $incomingToxicCombinations = is_array($policy['toxicCombinations'] ?? null) ? $policy['toxicCombinations'] : [];

        $normalizedCombinations = collect($defaults['toxicCombinations'])
            ->map(function (array $defaultRule) use ($incomingToxicCombinations) {
                $incoming = collect($incomingToxicCombinations)
                    ->first(fn ($rule) => is_array($rule) && (string) ($rule['key'] ?? '') === (string) $defaultRule['key']);

                return [
                    'key' => (string) $defaultRule['key'],
                    'label' => trim((string) ($incoming['label'] ?? $defaultRule['label'])),
                    'permissions' => collect($incoming['permissions'] ?? $defaultRule['permissions'])
                        ->map(fn ($permission) => trim((string) $permission))
                        ->filter()
                        ->take(2)
                        ->values()
                        ->all(),
                    'enforceRoleEdit' => (bool) ($incoming['enforceRoleEdit'] ?? $defaultRule['enforceRoleEdit']),
                    'enforceUserAssignment' => (bool) ($incoming['enforceUserAssignment'] ?? $defaultRule['enforceUserAssignment']),
                    'enabled' => (bool) ($incoming['enabled'] ?? $defaultRule['enabled']),
                ];
            })
            ->values()
            ->all();

        return [
            'enabled' => (bool) ($policy['enabled'] ?? $defaults['enabled']),
            'toxicCombinations' => $normalizedCombinations,
        ];
    }

    private function resolveSodControlPolicy(int $vendorUserId): array
    {
        $record = VendorCourierSetting::query()->firstWhere('vendor_user_id', $vendorUserId);
        $settings = is_array($record?->settings) ? $record->settings : [];
        $team = is_array($settings['team'] ?? null) ? $settings['team'] : [];
        $sodControl = is_array($team['sodControl'] ?? null) ? $team['sodControl'] : [];

        return $this->normalizeSodControlPolicy($sodControl);
    }

    private function findSodViolations(array $effectivePermissions, array $sodPolicy, string $context): array
    {
        if (!(bool) ($sodPolicy['enabled'] ?? false)) {
            return [];
        }

        $permissionSet = collect($effectivePermissions)
            ->map(fn ($permission) => (string) $permission)
            ->filter()
            ->unique()
            ->values();

        return collect($sodPolicy['toxicCombinations'] ?? [])
            ->filter(fn ($rule) => is_array($rule) && (bool) ($rule['enabled'] ?? true))
            ->filter(function (array $rule) use ($context) {
                if ($context === 'role_edit') {
                    return (bool) ($rule['enforceRoleEdit'] ?? true);
                }

                if ($context === 'user_assignment') {
                    return (bool) ($rule['enforceUserAssignment'] ?? true);
                }

                return true;
            })
            ->filter(function (array $rule) use ($permissionSet) {
                $pair = collect($rule['permissions'] ?? [])->map(fn ($permission) => (string) $permission)->filter()->values();
                return $pair->count() === 2
                    && $permissionSet->contains((string) $pair[0])
                    && $permissionSet->contains((string) $pair[1]);
            })
            ->map(fn ($rule) => (string) ($rule['label'] ?? 'Toxic permission combination detected.'))
            ->values()
            ->all();
    }

    private function validateSodPolicyOrFail(array $effectivePermissions, int $vendorUserId, string $context): void
    {
        $violations = $this->findSodViolations($effectivePermissions, $this->resolveSodControlPolicy($vendorUserId), $context);

        if (count($violations) === 0) {
            return;
        }

        abort(422, 'Separation of Duties violation: ' . implode(' | ', $violations));
    }

    private function resolveRolePermissionSet(int $workspaceId, string $roleName): array
    {
        if (trim($roleName) === '') {
            return [];
        }

        $role = Role::query()
            ->where('service_workspace_id', $workspaceId)
            ->where('guard_name', CourierRbac::GUARD)
            ->where('name', $roleName)
            ->with('permissions:id,name')
            ->first();

        if (!$role) {
            return [];
        }

        return $role->permissions
            ->pluck('name')
            ->map(fn ($permission) => (string) $permission)
            ->values()
            ->all();
    }

    private function assignableRoleNames(int $workspaceId): array
    {
        return collect($this->workspaceRoleNames($workspaceId))
            ->reject(fn ($role) => in_array($role, ['courier_owner'], true))
            ->values()
            ->all();
    }
}
