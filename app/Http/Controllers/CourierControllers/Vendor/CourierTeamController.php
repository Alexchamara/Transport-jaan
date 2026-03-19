<?php

namespace App\Http\Controllers\CourierControllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\ServiceWorkspace;
use App\Models\User;
use App\Models\VendorActivityLog;
use App\Models\VendorUserMembership;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class CourierTeamController extends Controller
{
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

        $roleNames = [
            'courier_owner',
            'courier_admin',
            'courier_dispatcher',
            'courier_tracking_officer',
            'courier_support',
            'courier_viewer',
        ];

        $rolePermissionMap = Role::query()
            ->whereIn('name', $roleNames)
            ->with('permissions:id,name')
            ->get()
            ->mapWithKeys(function (Role $role) {
                return [
                    $role->name => $role->permissions->pluck('name')->values(),
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
            'roleOptions' => collect($roleNames)->values(),
            'rolePermissionMap' => $rolePermissionMap,
            'permissionOptions' => Permission::query()
                ->where('name', 'like', 'courier.%')
                ->orderBy('name')
                ->pluck('name')
                ->values(),
            'serviceKey' => 'courier_service',
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
                        'createdAt' => optional($row->created_at)->format('Y-m-d H:i:s'),
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
        $canAssignRole = $actor->can('courier.team.assign_role');
        $canAssignPermissions = $actor->can('courier.team.assign_permissions');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:180'],
            'password' => ['nullable', 'string', 'min:8', 'max:120'],
            'role' => ['nullable', Rule::in([
                'courier_admin',
                'courier_dispatcher',
                'courier_tracking_officer',
                'courier_support',
                'courier_viewer',
            ])],
            'directPermissions' => ['nullable', 'array'],
            'directPermissions.*' => ['string', 'max:120'],
            'blockedServiceKeys' => ['nullable', 'array'],
            'blockedServiceKeys.*' => ['string', 'max:80'],
        ]);

        $email = strtolower(trim((string) $validated['email']));

        if (!$canAssignRole) {
            // Create-only operators can create users with least-privilege default role.
            $validated['role'] = 'courier_viewer';
        }

        if ($canAssignRole && empty($validated['role'])) {
            return back()->with('error', 'Role is required to create a team user.');
        }

        if (!$canAssignPermissions) {
            $validated['directPermissions'] = [];
        }

        $existingMembership = VendorUserMembership::query()
            ->whereHas('user', function ($query) use ($email) {
                $query->where('email', $email);
            })
            ->first();

        if ($existingMembership && (int) $existingMembership->vendor_user_id !== $vendorUserId) {
            return back()->with('error', 'This user already belongs to another vendor.');
        }

        DB::transaction(function () use ($validated, $email, $actor, $vendorUserId, $workspaceId) {
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
                    'blocked_service_keys' => array_values(array_unique($validated['blockedServiceKeys'] ?? [])),
                    'invited_by_user_id' => $actor->id,
                ],
            );

            $registrar = app(PermissionRegistrar::class);
            $registrar->setPermissionsTeamId($workspaceId);

            $user->syncRoles([$validated['role']]);
            $user->syncPermissions($validated['directPermissions'] ?? []);

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
                    'direct_permissions_count' => count($validated['directPermissions'] ?? []),
                    'blocked_service_keys' => $validated['blockedServiceKeys'] ?? [],
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

        $canAssignRole = $actor->can('courier.team.assign_role');
        $canAssignPermissions = $actor->can('courier.team.assign_permissions');
        $canManageStatus = $actor->can('courier.team.manage_status');

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
            'role' => ['nullable', Rule::in([
                'courier_admin',
                'courier_dispatcher',
                'courier_tracking_officer',
                'courier_support',
                'courier_viewer',
            ])],
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

        if ($roleChanged && !$canAssignRole) {
            abort(403, 'Missing required permission: courier.team.assign_role');
        }

        if ($permissionsChanged && !$canAssignPermissions) {
            abort(403, 'Missing required permission: courier.team.assign_permissions');
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

        DB::transaction(function () use ($validated, $workspaceId, $membership, $user, $request, $roleChanged, $permissionsChanged, $statusChanged, $blockedKeysChanged) {
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
                $user->syncPermissions($validated['directPermissions'] ?? []);
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
                    'role' => $validated['role'] ?? null,
                    'status' => $validated['status'] ?? null,
                    'direct_permissions_count' => count($validated['directPermissions'] ?? []),
                    'blocked_service_keys' => $validated['blockedServiceKeys'] ?? null,
                ],
            );
        });

        return back()->with('success', 'Team access updated successfully.');
    }

    public function bulkUpdate(Request $request)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $actor = $request->user();

        $validated = $request->validate([
            'userIds' => ['required', 'array', 'min:1', 'max:200'],
            'userIds.*' => ['required', 'integer'],
            'action' => ['required', Rule::in(['suspend', 'activate', 'revoke_all_sessions'])],
        ]);

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

        return back()->with('success', 'Courier ownership transferred successfully.');
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
    }
}
