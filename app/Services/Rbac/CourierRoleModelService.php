<?php

namespace App\Services\Rbac;

use App\Models\CourierRoleProfile;
use App\Models\CourierRoleProfileVersion;
use App\Models\User;
use App\Support\CourierRbac;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class CourierRoleModelService
{
    public function validCourierPermissions(): array
    {
        return Permission::query()
            ->where('name', 'like', 'courier.%')
            ->orderBy('name')
            ->pluck('name')
            ->map(fn ($perm) => (string) $perm)
            ->values()
            ->all();
    }

    public function predefinedRoleDefinitions(): array
    {
        return [
            'courier_owner' => [
                'label' => 'Courier Owner',
                'description' => 'Full control over courier workspace, governance, and ownership transfer.',
                'template' => 'governance',
            ],
            'courier_admin' => [
                'label' => 'Courier Admin',
                'description' => 'Administrative control across bookings, settings, and team operations.',
                'template' => 'operations_lead',
            ],
            'courier_dispatcher' => [
                'label' => 'Dispatcher',
                'description' => 'Day-to-day booking and shipment lifecycle execution role.',
                'template' => 'operations',
            ],
            'courier_tracking_officer' => [
                'label' => 'Tracking Officer',
                'description' => 'Shipment and tracking visibility with limited operational changes.',
                'template' => 'tracking',
            ],
            'courier_support' => [
                'label' => 'Support Agent',
                'description' => 'Customer and issue handling role for courier support team.',
                'template' => 'support',
            ],
            'courier_finance' => [
                'label' => 'Finance Analyst',
                'description' => 'Finance visibility role for rates and reports.',
                'template' => 'finance',
            ],
            'courier_viewer' => [
                'label' => 'Viewer',
                'description' => 'Read-only operational visibility role.',
                'template' => 'read_only',
            ],
        ];
    }

    public function roleTemplates(): array
    {
        $baseRoleMap = CourierRbac::roleMap();

        return [
            'operations' => [
                'label' => 'Operations Template',
                'description' => 'For dispatch and shipment operations teams.',
                'baseRole' => 'courier_dispatcher',
                'permissions' => $baseRoleMap['courier_dispatcher'] ?? [],
            ],
            'tracking' => [
                'label' => 'Tracking Template',
                'description' => 'For tracking and milestone management teams.',
                'baseRole' => 'courier_tracking_officer',
                'permissions' => $baseRoleMap['courier_tracking_officer'] ?? [],
            ],
            'support' => [
                'label' => 'Support Template',
                'description' => 'For customer communication and issue resolution teams.',
                'baseRole' => 'courier_support',
                'permissions' => $baseRoleMap['courier_support'] ?? [],
            ],
            'finance' => [
                'label' => 'Finance Template',
                'description' => 'For rate visibility and financial reporting teams.',
                'baseRole' => 'courier_finance',
                'permissions' => $baseRoleMap['courier_finance'] ?? [],
            ],
            'read_only' => [
                'label' => 'Read Only Template',
                'description' => 'For observers and reporting-only accounts.',
                'baseRole' => 'courier_viewer',
                'permissions' => $baseRoleMap['courier_viewer'] ?? [],
            ],
            'operations_lead' => [
                'label' => 'Operations Lead Template',
                'description' => 'For operational managers with broader controls.',
                'baseRole' => 'courier_admin',
                'permissions' => $baseRoleMap['courier_admin'] ?? [],
            ],
            'governance' => [
                'label' => 'Governance Template',
                'description' => 'For owners and top-level governance accounts.',
                'baseRole' => 'courier_owner',
                'permissions' => $baseRoleMap['courier_owner'] ?? [],
            ],
        ];
    }

    public function ensureWorkspaceRoleProfiles(int $workspaceId, ?int $actorUserId = null): void
    {
        $definitions = $this->predefinedRoleDefinitions();
        $roleMap = CourierRbac::roleMap();

        foreach ($definitions as $roleName => $definition) {
            $role = Role::query()->firstOrCreate(
                [
                    'service_workspace_id' => $workspaceId,
                    'name' => $roleName,
                    'guard_name' => CourierRbac::GUARD,
                ],
                []
            );

            if ($role->wasRecentlyCreated) {
                $role->syncPermissions($roleMap[$roleName] ?? []);
            }

            $profile = CourierRoleProfile::query()->firstOrCreate(
                [
                    'service_workspace_id' => $workspaceId,
                    'role_name' => $roleName,
                ],
                [
                    'role_label' => $definition['label'],
                    'source_type' => 'predefined',
                    'source_template' => $definition['template'] ?? null,
                    'description' => $definition['description'] ?? null,
                    'latest_version' => 1,
                    'is_system' => true,
                    'is_active' => true,
                    'created_by_user_id' => $actorUserId,
                    'updated_by_user_id' => $actorUserId,
                ]
            );

            if ($profile->wasRecentlyCreated) {
                $this->appendVersion(
                    $profile,
                    'seeded',
                    $role->permissions()->pluck('name')->toArray(),
                    [
                        'seed' => 'predefined',
                        'template' => $definition['template'] ?? null,
                    ],
                    $actorUserId
                );
            }
        }
    }

    public function listWorkspaceRoles(int $workspaceId): Collection
    {
        return Role::query()
            ->where('service_workspace_id', $workspaceId)
            ->where('guard_name', CourierRbac::GUARD)
            ->where('name', 'like', 'courier_%')
            ->with('permissions:id,name')
            ->orderBy('name')
            ->get()
            ->map(function (Role $role) use ($workspaceId) {
                $profile = CourierRoleProfile::query()
                    ->where('service_workspace_id', $workspaceId)
                    ->where('role_name', $role->name)
                    ->first();

                return [
                    'name' => (string) $role->name,
                    'label' => (string) ($profile?->role_label ?? Str::of($role->name)->replace('_', ' ')->title()),
                    'description' => $profile?->description,
                    'sourceType' => $profile?->source_type ?? 'custom',
                    'template' => $profile?->source_template,
                    'clonedFromRole' => $profile?->cloned_from_role,
                    'latestVersion' => (int) ($profile?->latest_version ?? 1),
                    'isSystem' => (bool) ($profile?->is_system ?? false),
                    'permissions' => $role->permissions->pluck('name')->map(fn ($item) => (string) $item)->values()->all(),
                ];
            })
            ->values();
    }

    public function createOrUpdateRole(
        int $workspaceId,
        array $input,
        User $actor,
        ?string $existingRoleName = null,
        string $changeType = 'updated'
    ): array {
        $validPermissions = collect($this->validCourierPermissions());
        $requestedPermissions = collect($input['permissions'] ?? [])
            ->map(fn ($perm) => (string) $perm)
            ->filter(fn ($perm) => $validPermissions->contains($perm))
            ->unique()
            ->values()
            ->all();

        $roleName = $existingRoleName ?: $this->normalizeRoleName((string) ($input['name'] ?? ''), $workspaceId);

        if ($existingRoleName === null && Role::query()
            ->where('service_workspace_id', $workspaceId)
            ->where('name', $roleName)
            ->where('guard_name', CourierRbac::GUARD)
            ->exists()) {
            throw new \InvalidArgumentException('Role name already exists in this courier workspace.');
        }

        return DB::transaction(function () use ($workspaceId, $input, $actor, $roleName, $requestedPermissions, $existingRoleName, $changeType) {
            $role = Role::query()->firstOrCreate(
                [
                    'service_workspace_id' => $workspaceId,
                    'name' => $roleName,
                    'guard_name' => CourierRbac::GUARD,
                ],
                []
            );

            $role->syncPermissions($requestedPermissions);

            $profile = CourierRoleProfile::query()->firstOrCreate(
                [
                    'service_workspace_id' => $workspaceId,
                    'role_name' => $roleName,
                ],
                [
                    'role_label' => (string) ($input['label'] ?? Str::of($roleName)->replace('_', ' ')->title()),
                    'source_type' => (string) ($input['sourceType'] ?? ($existingRoleName ? 'custom' : 'custom')),
                    'source_template' => $input['template'] ?? null,
                    'cloned_from_role' => $input['clonedFromRole'] ?? null,
                    'description' => (string) ($input['description'] ?? ''),
                    'latest_version' => 1,
                    'is_system' => (bool) ($input['isSystem'] ?? false),
                    'is_active' => true,
                    'created_by_user_id' => $actor->id,
                    'updated_by_user_id' => $actor->id,
                ]
            );

            $profile->fill([
                'role_label' => (string) ($input['label'] ?? $profile->role_label),
                'description' => (string) ($input['description'] ?? $profile->description),
                'source_type' => (string) ($input['sourceType'] ?? $profile->source_type),
                'source_template' => $input['template'] ?? $profile->source_template,
                'cloned_from_role' => $input['clonedFromRole'] ?? $profile->cloned_from_role,
                'updated_by_user_id' => $actor->id,
            ]);
            $profile->save();

            $nextVersion = ((int) $profile->latest_version) + ($profile->wasRecentlyCreated ? 0 : 1);
            if (!$profile->wasRecentlyCreated) {
                $profile->latest_version = $nextVersion;
                $profile->save();
            }

            $version = $this->appendVersion(
                $profile,
                $profile->wasRecentlyCreated ? 'created' : $changeType,
                $requestedPermissions,
                [
                    'existingRoleName' => $existingRoleName,
                ],
                $actor->id
            );

            return [
                'role' => [
                    'name' => $roleName,
                    'label' => $profile->role_label,
                    'description' => $profile->description,
                    'sourceType' => $profile->source_type,
                    'template' => $profile->source_template,
                    'clonedFromRole' => $profile->cloned_from_role,
                    'latestVersion' => (int) $profile->latest_version,
                    'isSystem' => (bool) $profile->is_system,
                    'permissions' => $requestedPermissions,
                ],
                'version' => [
                    'version' => (int) $version->version,
                    'changeType' => (string) $version->change_type,
                    'createdAt' => optional($version->created_at)->toDateTimeString(),
                ],
            ];
        });
    }

    public function createRoleFromTemplate(int $workspaceId, array $input, User $actor): array
    {
        $templates = $this->roleTemplates();
        $templateKey = (string) ($input['template'] ?? '');

        if (!array_key_exists($templateKey, $templates)) {
            throw new \InvalidArgumentException('Unknown template selected for courier role creation.');
        }

        $template = $templates[$templateKey];

        return $this->createOrUpdateRole(
            $workspaceId,
            [
                'name' => $input['name'] ?? null,
                'label' => $input['label'] ?? $template['label'],
                'description' => $input['description'] ?? $template['description'],
                'permissions' => $input['permissions'] ?? $template['permissions'],
                'sourceType' => 'template',
                'template' => $templateKey,
            ],
            $actor,
            null,
            'templated'
        );
    }

    public function cloneRole(int $workspaceId, string $sourceRoleName, array $input, User $actor): array
    {
        $sourceRole = Role::query()
            ->where('service_workspace_id', $workspaceId)
            ->where('name', $sourceRoleName)
            ->where('guard_name', CourierRbac::GUARD)
            ->with('permissions:id,name')
            ->firstOrFail();

        return $this->createOrUpdateRole(
            $workspaceId,
            [
                'name' => $input['name'] ?? null,
                'label' => $input['label'] ?? (Str::of($sourceRoleName)->replace('_', ' ')->title() . ' Clone'),
                'description' => $input['description'] ?? 'Cloned from ' . $sourceRoleName,
                'permissions' => $input['permissions'] ?? $sourceRole->permissions->pluck('name')->all(),
                'sourceType' => 'clone',
                'clonedFromRole' => $sourceRoleName,
            ],
            $actor,
            null,
            'cloned'
        );
    }

    public function roleVersions(int $workspaceId, string $roleName): Collection
    {
        $profile = CourierRoleProfile::query()
            ->where('service_workspace_id', $workspaceId)
            ->where('role_name', $roleName)
            ->first();

        if (!$profile) {
            return collect();
        }

        return CourierRoleProfileVersion::query()
            ->where('courier_role_profile_id', $profile->id)
            ->orderByDesc('version')
            ->get()
            ->map(fn (CourierRoleProfileVersion $version) => [
                'version' => (int) $version->version,
                'changeType' => (string) $version->change_type,
                'roleLabel' => (string) $version->role_label,
                'description' => $version->description,
                'permissions' => array_values($version->permissions ?? []),
                'metadata' => $version->metadata,
                'changedByUserId' => $version->changed_by_user_id,
                'createdAt' => optional($version->created_at)->toDateTimeString(),
            ])
            ->values();
    }

    private function appendVersion(
        CourierRoleProfile $profile,
        string $changeType,
        array $permissions,
        array $metadata,
        ?int $actorUserId = null
    ): CourierRoleProfileVersion {
        $nextVersion = (int) $profile->latest_version;

        return CourierRoleProfileVersion::query()->create([
            'courier_role_profile_id' => $profile->id,
            'version' => $nextVersion,
            'change_type' => $changeType,
            'role_label' => $profile->role_label,
            'description' => $profile->description,
            'permissions' => array_values($permissions),
            'metadata' => $metadata,
            'changed_by_user_id' => $actorUserId,
            'created_at' => now(),
        ]);
    }

    private function normalizeRoleName(string $name, int $workspaceId): string
    {
        $candidate = Str::of($name)->trim()->lower()->replaceMatches('/[^a-z0-9_]+/', '_')->trim('_')->toString();

        if ($candidate === '') {
            $candidate = 'custom_role_' . $workspaceId . '_' . Str::lower(Str::random(5));
        }

        if (!Str::startsWith($candidate, 'courier_')) {
            $candidate = 'courier_' . $candidate;
        }

        return $candidate;
    }
}
