<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierTeamSecurityAudit;
use App\Models\VendorActivityLog;
use Illuminate\Http\Request;

class CourierTeamSecurityAuditService
{
    private const PRIVILEGED_ROLES = [
        'courier_owner',
        'courier_admin',
        'courier_finance',
    ];

    private const SENSITIVE_PERMISSIONS = [
        'courier.team.assign_permissions',
        'courier.team.assign_role',
        'courier.team.transfer_ownership',
        'courier.refunds.approve',
        'courier.settings.update',
    ];

    public function recordFromTeamAction(
        Request $request,
        string $action,
        string $targetType,
        int $targetId,
        array $metadata = []
    ): void {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        if ($vendorUserId <= 0) {
            return;
        }

        $workspaceId = (int) $request->attributes->get('service_workspace_id');
        $eventType = $this->eventTypeFromAction($action);
        $eventFamily = $this->eventFamilyFromEventType($eventType);
        $before = is_array($metadata['before_snapshot'] ?? null) ? $metadata['before_snapshot'] : [];
        $after = is_array($metadata['after_snapshot'] ?? null) ? $metadata['after_snapshot'] : [];

        $this->recordImmutableEvent($request, [
            'vendor_user_id' => $vendorUserId,
            'service_workspace_id' => $workspaceId > 0 ? $workspaceId : null,
            'actor_user_id' => (int) optional($request->user())->id ?: null,
            'event_type' => $eventType,
            'event_family' => $eventFamily,
            'target_type' => $targetType,
            'target_id' => $targetId > 0 ? $targetId : null,
            'status_code' => 200,
            'before_snapshot' => $before,
            'after_snapshot' => $after,
            'metadata' => $metadata,
        ]);

        if ($eventFamily === 'change') {
            $this->evaluateChangeAlerts($request, $eventType, $before, $after, $metadata);
        }
    }

    public function recordPermissionDenied(Request $request, string $reason, array $metadata = []): void
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        if ($vendorUserId <= 0) {
            return;
        }

        $workspaceId = (int) $request->attributes->get('service_workspace_id');

        $this->recordImmutableEvent($request, [
            'vendor_user_id' => $vendorUserId,
            'service_workspace_id' => $workspaceId > 0 ? $workspaceId : null,
            'actor_user_id' => (int) optional($request->user())->id ?: null,
            'event_type' => 'access_denied',
            'event_family' => 'monitoring',
            'target_type' => 'permission_gate',
            'target_id' => null,
            'status_code' => 403,
            'metadata' => array_merge([
                'reason' => $reason,
            ], $metadata),
        ]);

        $this->evaluateFailedAccessSpikeAlert($request, $vendorUserId, $workspaceId > 0 ? $workspaceId : null);
    }

    public function recordAuthChallengeFailure(Request $request, string $reason, array $metadata = []): void
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        if ($vendorUserId <= 0) {
            return;
        }

        $workspaceId = (int) $request->attributes->get('service_workspace_id');

        $this->recordImmutableEvent($request, [
            'vendor_user_id' => $vendorUserId,
            'service_workspace_id' => $workspaceId > 0 ? $workspaceId : null,
            'actor_user_id' => (int) optional($request->user())->id ?: null,
            'event_type' => 'auth_challenge_failed',
            'event_family' => 'monitoring',
            'target_type' => 'step_up_auth',
            'target_id' => (int) optional($request->user())->id ?: null,
            'status_code' => 422,
            'metadata' => array_merge([
                'reason' => $reason,
            ], $metadata),
        ]);

        $this->evaluateFailedAccessSpikeAlert($request, $vendorUserId, $workspaceId > 0 ? $workspaceId : null);
    }

    private function evaluateChangeAlerts(Request $request, string $eventType, array $before, array $after, array $metadata): void
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');

        $beforePermissions = collect($before['direct_permissions'] ?? $before['permissions'] ?? [])->map(fn ($p) => (string) $p)->values();
        $afterPermissions = collect($after['direct_permissions'] ?? $after['permissions'] ?? [])->map(fn ($p) => (string) $p)->values();
        $addedPermissions = $afterPermissions->diff($beforePermissions)->values();
        $highRiskGrant = $addedPermissions->contains(fn ($perm) => in_array($perm, self::SENSITIVE_PERMISSIONS, true));

        if ($addedPermissions->count() >= 5 || $highRiskGrant) {
            $this->recordAlert($request, [
                'vendor_user_id' => $vendorUserId,
                'service_workspace_id' => $workspaceId > 0 ? $workspaceId : null,
                'actor_user_id' => (int) optional($request->user())->id ?: null,
                'event_type' => 'unusual_permission_grant',
                'event_family' => 'alert',
                'target_type' => 'permission',
                'target_id' => (int) ($metadata['target_user_id'] ?? 0) ?: null,
                'status_code' => 200,
                'alert_code' => 'unusual_permission_grant',
                'metadata' => [
                    'source_event' => $eventType,
                    'added_permissions' => $addedPermissions->values()->all(),
                    'high_risk_grant' => $highRiskGrant,
                ],
            ]);
        }

        $beforeRole = (string) ($before['role'] ?? '');
        $afterRole = (string) ($after['role'] ?? '');
        if ($afterRole !== '' && $beforeRole !== $afterRole && $this->isPrivilegeEscalation($beforeRole, $afterRole)) {
            $this->recordAlert($request, [
                'vendor_user_id' => $vendorUserId,
                'service_workspace_id' => $workspaceId > 0 ? $workspaceId : null,
                'actor_user_id' => (int) optional($request->user())->id ?: null,
                'event_type' => 'privilege_escalation_detected',
                'event_family' => 'alert',
                'target_type' => 'role',
                'target_id' => (int) ($metadata['target_user_id'] ?? 0) ?: null,
                'status_code' => 200,
                'alert_code' => 'privilege_escalation',
                'metadata' => [
                    'source_event' => $eventType,
                    'before_role' => $beforeRole,
                    'after_role' => $afterRole,
                ],
            ]);
        }
    }

    private function evaluateFailedAccessSpikeAlert(Request $request, int $vendorUserId, ?int $workspaceId): void
    {
        $actorUserId = (int) optional($request->user())->id;
        if ($actorUserId <= 0) {
            return;
        }

        $windowStart = now()->subMinutes(15);

        $attempts = CourierTeamSecurityAudit::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('actor_user_id', $actorUserId)
            ->whereIn('event_type', ['access_denied', 'auth_challenge_failed'])
            ->when($workspaceId, fn ($query) => $query->where('service_workspace_id', $workspaceId))
            ->where('created_at', '>=', $windowStart)
            ->count();

        if ($attempts < 5) {
            return;
        }

        $this->recordAlert($request, [
            'vendor_user_id' => $vendorUserId,
            'service_workspace_id' => $workspaceId,
            'actor_user_id' => $actorUserId,
            'event_type' => 'failed_access_spike',
            'event_family' => 'alert',
            'target_type' => 'access',
            'target_id' => $actorUserId,
            'status_code' => 403,
            'alert_code' => 'failed_access_spike',
            'metadata' => [
                'failed_attempts_last_15_minutes' => $attempts,
            ],
        ]);
    }

    private function recordAlert(Request $request, array $payload): void
    {
        $payload['is_alert'] = true;
        $this->recordImmutableEvent($request, $payload);

        try {
            VendorActivityLog::query()->create([
                'vendor_id' => (int) $payload['vendor_user_id'],
                'admin_id' => (int) ($payload['actor_user_id'] ?? 0) ?: null,
                'action' => 'courier_team_security_alert',
                'target_type' => (string) ($payload['target_type'] ?? 'security_alert'),
                'target_id' => (int) ($payload['target_id'] ?? 0) ?: null,
                'description' => 'Courier team security alert generated by monitoring policy.',
                'metadata' => [
                    'event_type' => (string) ($payload['event_type'] ?? ''),
                    'alert_code' => (string) ($payload['alert_code'] ?? ''),
                    'details' => $payload['metadata'] ?? [],
                ],
            ]);
        } catch (\Throwable) {
            // Ignore mirror failures.
        }
    }

    private function recordImmutableEvent(Request $request, array $payload): void
    {
        try {
            $vendorUserId = (int) ($payload['vendor_user_id'] ?? 0);
            if ($vendorUserId <= 0) {
                return;
            }

            $workspaceId = (int) ($payload['service_workspace_id'] ?? 0);
            $before = is_array($payload['before_snapshot'] ?? null) ? $payload['before_snapshot'] : null;
            $after = is_array($payload['after_snapshot'] ?? null) ? $payload['after_snapshot'] : null;
            $diff = $this->buildSnapshotDiff($before, $after);

            $previousHash = CourierTeamSecurityAudit::query()
                ->where('vendor_user_id', $vendorUserId)
                ->when($workspaceId > 0, fn ($query) => $query->where('service_workspace_id', $workspaceId))
                ->orderByDesc('id')
                ->value('record_hash');

            $canonical = $this->canonicalize([
                'vendor_user_id' => $vendorUserId,
                'service_workspace_id' => $workspaceId > 0 ? $workspaceId : null,
                'actor_user_id' => (int) ($payload['actor_user_id'] ?? 0) ?: null,
                'event_type' => (string) ($payload['event_type'] ?? 'unknown_event'),
                'event_family' => (string) ($payload['event_family'] ?? 'other'),
                'target_type' => (string) ($payload['target_type'] ?? ''),
                'target_id' => (int) ($payload['target_id'] ?? 0) ?: null,
                'route_name' => (string) ($payload['route_name'] ?? ($request->route()?->getName() ?? '')),
                'ip_address' => (string) ($payload['ip_address'] ?? $request->ip()),
                'user_agent' => (string) ($payload['user_agent'] ?? substr((string) $request->userAgent(), 0, 512)),
                'status_code' => (int) ($payload['status_code'] ?? 200),
                'before_snapshot' => $before,
                'after_snapshot' => $after,
                'snapshot_diff' => $diff,
                'metadata' => is_array($payload['metadata'] ?? null) ? $payload['metadata'] : [],
                'is_alert' => (bool) ($payload['is_alert'] ?? false),
                'alert_code' => (string) ($payload['alert_code'] ?? ''),
                'created_at' => now()->format('Y-m-d H:i:s'),
            ]);

            $recordHash = hash('sha256', (($previousHash ?: 'GENESIS') . '|' . json_encode($canonical, JSON_UNESCAPED_SLASHES)));

            CourierTeamSecurityAudit::query()->create([
                'vendor_user_id' => $vendorUserId,
                'service_workspace_id' => $workspaceId > 0 ? $workspaceId : null,
                'actor_user_id' => (int) ($payload['actor_user_id'] ?? 0) ?: null,
                'event_type' => (string) ($payload['event_type'] ?? 'unknown_event'),
                'event_family' => (string) ($payload['event_family'] ?? 'other'),
                'target_type' => (string) ($payload['target_type'] ?? null),
                'target_id' => (int) ($payload['target_id'] ?? 0) ?: null,
                'route_name' => (string) ($payload['route_name'] ?? ($request->route()?->getName() ?? '')),
                'ip_address' => (string) ($payload['ip_address'] ?? $request->ip()),
                'user_agent' => substr((string) ($payload['user_agent'] ?? $request->userAgent()), 0, 512),
                'status_code' => (int) ($payload['status_code'] ?? 200),
                'before_snapshot' => $before,
                'after_snapshot' => $after,
                'snapshot_diff' => $diff,
                'metadata' => is_array($payload['metadata'] ?? null) ? $payload['metadata'] : [],
                'is_alert' => (bool) ($payload['is_alert'] ?? false),
                'alert_code' => (string) ($payload['alert_code'] ?? null),
                'previous_hash' => $previousHash,
                'record_hash' => $recordHash,
                'created_at' => now(),
            ]);
        } catch (\Throwable) {
            // Never break business flow on audit failure.
        }
    }

    private function buildSnapshotDiff(?array $before, ?array $after): array
    {
        $before = is_array($before) ? $before : [];
        $after = is_array($after) ? $after : [];

        $keys = collect(array_merge(array_keys($before), array_keys($after)))->unique()->values();
        $diff = [];

        foreach ($keys as $key) {
            $left = $before[$key] ?? null;
            $right = $after[$key] ?? null;

            if ($left === $right) {
                continue;
            }

            $diff[] = [
                'field' => (string) $key,
                'before' => $left,
                'after' => $right,
            ];
        }

        return $diff;
    }

    private function canonicalize($value)
    {
        if (!is_array($value)) {
            return $value;
        }

        $isAssoc = array_keys($value) !== range(0, count($value) - 1);

        if ($isAssoc) {
            ksort($value);
        }

        foreach ($value as $key => $item) {
            $value[$key] = $this->canonicalize($item);
        }

        return $value;
    }

    private function eventTypeFromAction(string $action): string
    {
        return match ($action) {
            'courier_team_user_created' => 'user_created',
            'courier_team_access_updated' => 'user_access_changed',
            'courier_team_access_control_updated' => 'team_policy_changed',
            'courier_team_bulk_updated' => 'bulk_user_change',
            'courier_team_api_credential_created' => 'api_key_created',
            'courier_team_api_credential_rotated' => 'api_key_rotated',
            'courier_team_api_credential_revoked' => 'api_key_revoked',
            'courier_team_sensitive_action_approval_approved',
            'courier_team_sensitive_action_approval_rejected',
            'courier_team_break_glass_activated',
            'courier_team_temp_access_approved',
            'courier_team_temp_access_rejected',
            'courier_team_temp_access_revoked',
            'courier_team_access_review_certified',
            'courier_team_ownership_transferred' => 'sensitive_action',
            default => $action,
        };
    }

    private function eventFamilyFromEventType(string $eventType): string
    {
        return match ($eventType) {
            'user_created',
            'user_access_changed',
            'team_policy_changed',
            'bulk_user_change',
            'api_key_created',
            'api_key_rotated',
            'api_key_revoked' => 'change',
            'sensitive_action' => 'sensitive_action',
            'access_denied' => 'monitoring',
            'unusual_permission_grant',
            'privilege_escalation_detected',
            'failed_access_spike' => 'alert',
            default => 'other',
        };
    }

    private function isPrivilegeEscalation(string $beforeRole, string $afterRole): bool
    {
        $rank = [
            'courier_viewer' => 1,
            'courier_tracking_officer' => 2,
            'courier_support' => 2,
            'courier_dispatcher' => 3,
            'courier_finance' => 3,
            'courier_admin' => 4,
            'courier_owner' => 5,
        ];

        $beforeRank = (int) ($rank[$beforeRole] ?? 0);
        $afterRank = (int) ($rank[$afterRole] ?? 0);

        return $afterRank > $beforeRank || in_array($afterRole, self::PRIVILEGED_ROLES, true);
    }
}
