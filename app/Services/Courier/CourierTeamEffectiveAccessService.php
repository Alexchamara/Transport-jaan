<?php

namespace App\Services\Courier;

use App\Models\Courier\VendorCourierSetting;
use Spatie\Permission\Models\Role;

class CourierTeamEffectiveAccessService
{
    public function preview(
        int $vendorUserId,
        int $workspaceId,
        string $roleName,
        array $explicitGrants = [],
        array $context = []
    ): array {
        $roleName = trim($roleName);
        $rolePermissions = $this->rolePermissions($workspaceId, $roleName);
        $teamAccessControl = $this->teamAccessControl($vendorUserId);
        $roleDefaults = collect($teamAccessControl['defaultDirectPermissionsByRole'][$roleName] ?? [])
            ->map(fn ($permission) => (string) $permission)
            ->filter()
            ->values()
            ->all();

        $explicit = collect($explicitGrants)
            ->map(fn ($permission) => (string) $permission)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $allCandidates = collect($rolePermissions)
            ->merge($roleDefaults)
            ->merge($explicit)
            ->filter()
            ->unique()
            ->values();

        $sources = [];
        foreach ($allCandidates as $permission) {
            $labels = [];
            if (in_array($permission, $rolePermissions, true)) {
                $labels[] = 'role';
            }
            if (in_array($permission, $roleDefaults, true)) {
                $labels[] = 'role_default';
            }
            if (in_array($permission, $explicit, true)) {
                $labels[] = 'explicit_grant';
            }
            $sources[$permission] = $labels;
        }

        $permissionModel = $this->permissionModel($vendorUserId);
        $rolePolicy = is_array($permissionModel['rolePolicies'][$roleName] ?? null)
            ? $permissionModel['rolePolicies'][$roleName]
            : [];

        $rows = [];
        $effective = [];
        $denied = [];

        foreach ($allCandidates as $permission) {
            $decision = $this->evaluatePermission($permission, $roleName, $rolePolicy, $context);
            $base = [
                'permission' => $permission,
                'sources' => $sources[$permission] ?? [],
                'resource' => $decision['resource'],
                'action' => $decision['action'],
            ];

            if ((bool) ($decision['allowed'] ?? false)) {
                $effective[] = $permission;
                $rows[] = array_merge($base, [
                    'status' => 'allowed',
                    'explanation' => $decision['explanation'] ?: "Allowed for role {$roleName}.",
                ]);
                continue;
            }

            $denied[] = [
                'permission' => $permission,
                'reasonCode' => (string) ($decision['reasonCode'] ?? 'denied'),
                'explanation' => (string) ($decision['explanation'] ?? 'Denied by policy.'),
            ];

            $rows[] = array_merge($base, [
                'status' => 'denied',
                'explanation' => (string) ($decision['explanation'] ?? 'Denied by policy.'),
                'reasonCode' => (string) ($decision['reasonCode'] ?? 'denied'),
            ]);
        }

        return [
            'roleName' => $roleName,
            'effectivePermissions' => array_values(array_unique($effective)),
            'rows' => $rows,
            'denied' => $denied,
            'summary' => [
                'allowedCount' => count($effective),
                'deniedCount' => count($denied),
                'candidateCount' => $allCandidates->count(),
            ],
        ];
    }

    private function evaluatePermission(string $permission, string $roleName, array $rolePolicy, array $context): array
    {
        [$resource, $action] = $this->inferResourceAction($permission);

        $resourcePolicy = is_array($rolePolicy['resources'][$resource] ?? null)
            ? $rolePolicy['resources'][$resource]
            : [];

        if (array_key_exists($action, $resourcePolicy) && $resourcePolicy[$action] === false) {
            return [
                'allowed' => false,
                'resource' => $resource,
                'action' => $action,
                'reasonCode' => 'resource_action_denied',
                'explanation' => "Denied because policy for role {$roleName} blocks {$action} on {$resource}.",
            ];
        }

        $constraints = is_array($rolePolicy['constraints'] ?? null) ? $rolePolicy['constraints'] : [];
        $regionZones = collect($constraints['regionZones'] ?? [])->map(fn ($item) => trim((string) $item))->filter()->values()->all();
        $hubBranches = collect($constraints['hubBranches'] ?? [])->map(fn ($item) => trim((string) $item))->filter()->values()->all();

        $contextRegion = trim((string) ($context['regionZone'] ?? ''));
        if (!empty($regionZones) && $contextRegion !== '' && !in_array($contextRegion, $regionZones, true)) {
            return [
                'allowed' => false,
                'resource' => $resource,
                'action' => $action,
                'reasonCode' => 'region_scope_denied',
                'explanation' => "Denied because policy for role {$roleName} only allows regions: " . implode(', ', $regionZones) . ".",
            ];
        }

        $contextHub = trim((string) ($context['hubBranch'] ?? ''));
        if (!empty($hubBranches) && $contextHub !== '' && !in_array($contextHub, $hubBranches, true)) {
            return [
                'allowed' => false,
                'resource' => $resource,
                'action' => $action,
                'reasonCode' => 'hub_scope_denied',
                'explanation' => "Denied because policy for role {$roleName} only allows hubs: " . implode(', ', $hubBranches) . ".",
            ];
        }

        $rules = is_array($constraints['policyRules'] ?? null) ? $constraints['policyRules'] : [];
        foreach ($rules as $rule) {
            if (!$this->ruleTargetsActionAndResource($rule, $resource, $action)) {
                continue;
            }

            if (!$this->ruleConditionsMatchContext($rule, $context)) {
                continue;
            }

            if ((string) ($rule['effect'] ?? 'allow') === 'deny') {
                $label = trim((string) ($rule['label'] ?? 'Unnamed policy rule'));
                return [
                    'allowed' => false,
                    'resource' => $resource,
                    'action' => $action,
                    'reasonCode' => 'deny_rule',
                    'explanation' => "Denied because policy {$label} for role {$roleName}" . ($contextRegion !== '' ? " in region {$contextRegion}" : '') . '.',
                ];
            }
        }

        return [
            'allowed' => true,
            'resource' => $resource,
            'action' => $action,
            'reasonCode' => null,
            'explanation' => "Allowed because role {$roleName} permits {$action} on {$resource}.",
        ];
    }

    private function inferResourceAction(string $permission): array
    {
        $trimmed = trim($permission);
        $segments = explode('.', $trimmed);
        if (count($segments) < 3 || $segments[0] !== 'courier') {
            return ['other', 'view'];
        }

        $resource = (string) ($segments[1] ?? 'other');
        $tail = implode('.', array_slice($segments, 2));

        if (str_contains($tail, 'view') || str_contains($tail, 'read') || str_contains($tail, 'export')) {
            return [$resource, 'view'];
        }

        if (str_contains($tail, 'create') || str_contains($tail, 'store')) {
            return [$resource, 'create'];
        }

        if (str_contains($tail, 'cancel') || str_contains($tail, 'revoke') || str_contains($tail, 'reject')) {
            return [$resource, 'cancel'];
        }

        if (str_contains($tail, 'approve')) {
            return [$resource, 'approve'];
        }

        if (str_contains($tail, 'refund')) {
            return [$resource, 'refund'];
        }

        return [$resource, 'update'];
    }

    private function ruleTargetsActionAndResource(array $rule, string $resource, string $action): bool
    {
        $ruleResource = trim((string) ($rule['resource'] ?? '*'));
        $ruleAction = trim((string) ($rule['action'] ?? '*'));

        return ($ruleResource === '*' || $ruleResource === $resource)
            && ($ruleAction === '*' || $ruleAction === $action);
    }

    private function ruleConditionsMatchContext(array $rule, array $context): bool
    {
        $conditions = is_array($rule['conditions'] ?? null) ? $rule['conditions'] : [];

        $shipmentStages = collect($conditions['shipmentStages'] ?? [])->map(fn ($item) => trim((string) $item))->filter()->values()->all();
        if (!empty($shipmentStages)) {
            $contextStage = trim((string) ($context['shipmentStage'] ?? ''));
            if ($contextStage === '' || !in_array($contextStage, $shipmentStages, true)) {
                return false;
            }
        }

        $minAmount = is_numeric($conditions['minAmount'] ?? null) ? (float) $conditions['minAmount'] : null;
        if ($minAmount !== null && (!is_numeric($context['amount'] ?? null) || (float) $context['amount'] < $minAmount)) {
            return false;
        }

        $maxAmount = is_numeric($conditions['maxAmount'] ?? null) ? (float) $conditions['maxAmount'] : null;
        if ($maxAmount !== null && (!is_numeric($context['amount'] ?? null) || (float) $context['amount'] > $maxAmount)) {
            return false;
        }

        $clientTiers = collect($conditions['clientTiers'] ?? [])->map(fn ($item) => trim((string) $item))->filter()->values()->all();
        if (!empty($clientTiers)) {
            $contextTier = trim((string) ($context['clientTier'] ?? ''));
            if ($contextTier === '' || !in_array($contextTier, $clientTiers, true)) {
                return false;
            }
        }

        $slaClasses = collect($conditions['slaClasses'] ?? [])->map(fn ($item) => trim((string) $item))->filter()->values()->all();
        if (!empty($slaClasses)) {
            $contextSla = trim((string) ($context['slaClass'] ?? ''));
            if ($contextSla === '' || !in_array($contextSla, $slaClasses, true)) {
                return false;
            }
        }

        return true;
    }

    private function rolePermissions(int $workspaceId, string $roleName): array
    {
        if ($roleName === '') {
            return [];
        }

        $role = Role::query()
            ->where('service_workspace_id', $workspaceId)
            ->where('guard_name', 'web')
            ->where('name', $roleName)
            ->with('permissions:id,name')
            ->first();

        if (!$role) {
            return [];
        }

        return $role->permissions
            ->pluck('name')
            ->map(fn ($permission) => (string) $permission)
            ->filter(fn ($permission) => str_starts_with($permission, 'courier.'))
            ->values()
            ->all();
    }

    private function teamAccessControl(int $vendorUserId): array
    {
        $settings = $this->vendorSettings($vendorUserId);
        $team = is_array($settings['team'] ?? null) ? $settings['team'] : [];

        return is_array($team['teamAccessControl'] ?? null)
            ? $team['teamAccessControl']
            : [];
    }

    private function permissionModel(int $vendorUserId): array
    {
        $settings = $this->vendorSettings($vendorUserId);
        $team = is_array($settings['team'] ?? null) ? $settings['team'] : [];

        return is_array($team['permissionModel'] ?? null)
            ? $team['permissionModel']
            : [];
    }

    private function vendorSettings(int $vendorUserId): array
    {
        $record = VendorCourierSetting::query()->firstWhere('vendor_user_id', $vendorUserId);

        return is_array($record?->settings)
            ? $record->settings
            : [];
    }
}
