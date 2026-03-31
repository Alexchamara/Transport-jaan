<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierServiceApiCredential;
use App\Models\Courier\VendorCourierSetting;
use App\Models\VendorActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class CourierApiServiceAccessService
{
    private const SCOPE_PERMISSION_MAP = [
        'service.status.read' => 'courier.dashboard.view',
        'bookings.read' => 'courier.bookings.view',
        'bookings.write' => 'courier.bookings.manage_lifecycle',
        'shipments.read' => 'courier.shipments.view',
        'shipments.write' => 'courier.shipments.update_stage',
        'tracking.read' => 'courier.tracking.view',
        'clients.read' => 'courier.clients.view',
        'clients.write' => 'courier.clients.manage',
        'finance.read' => 'courier.finance.view',
        'settings.read' => 'courier.settings.view',
        'settings.write' => 'courier.settings.update',
        'webhook.events.write' => 'courier.tracking.view',
    ];

    public function defaultPolicy(): array
    {
        return [
            'enabled' => true,
            'requireExpiry' => true,
            'defaultTtlDays' => 30,
            'maxTtlDays' => 90,
            'allowWebhookScopes' => true,
            'maxActiveKeysPerServiceAccount' => 2,
            'webhookScopesCatalog' => [
                'webhook.events.write',
            ],
        ];
    }

    public function normalizePolicy(array $input): array
    {
        $defaults = $this->defaultPolicy();

        return [
            'enabled' => (bool) ($input['enabled'] ?? $defaults['enabled']),
            'requireExpiry' => (bool) ($input['requireExpiry'] ?? $defaults['requireExpiry']),
            'defaultTtlDays' => max(1, min(365, (int) ($input['defaultTtlDays'] ?? $defaults['defaultTtlDays']))),
            'maxTtlDays' => max(1, min(365, (int) ($input['maxTtlDays'] ?? $defaults['maxTtlDays']))),
            'allowWebhookScopes' => (bool) ($input['allowWebhookScopes'] ?? $defaults['allowWebhookScopes']),
            'maxActiveKeysPerServiceAccount' => max(1, min(10, (int) ($input['maxActiveKeysPerServiceAccount'] ?? $defaults['maxActiveKeysPerServiceAccount']))),
            'webhookScopesCatalog' => collect($input['webhookScopesCatalog'] ?? $defaults['webhookScopesCatalog'])
                ->map(fn ($scope) => trim((string) $scope))
                ->filter(fn ($scope) => $scope !== '' && Str::startsWith($scope, 'webhook.'))
                ->unique()
                ->values()
                ->all(),
        ];
    }

    public function resolvePolicyForVendor(int $vendorUserId): array
    {
        $record = VendorCourierSetting::query()->firstWhere('vendor_user_id', $vendorUserId);
        $settings = is_array($record?->settings) ? $record->settings : [];
        $team = is_array($settings['team'] ?? null) ? $settings['team'] : [];

        return $this->normalizePolicy(is_array($team['apiServiceAccessControl'] ?? null) ? $team['apiServiceAccessControl'] : []);
    }

    public function apiScopeCatalog(): array
    {
        return array_keys(self::SCOPE_PERMISSION_MAP);
    }

    public function listCredentials(int $vendorUserId, int $workspaceId): array
    {
        return CourierServiceApiCredential::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('service_workspace_id', $workspaceId)
            ->orderByDesc('id')
            ->limit(100)
            ->get()
            ->map(function (CourierServiceApiCredential $credential) {
                return [
                    'id' => (int) $credential->id,
                    'credentialName' => (string) $credential->credential_name,
                    'serviceAccountCode' => (string) $credential->service_account_code,
                    'roleName' => (string) $credential->role_name,
                    'permissionScopes' => array_values($credential->permission_scopes ?? []),
                    'webhookScopes' => array_values($credential->webhook_scopes ?? []),
                    'keyPrefix' => (string) $credential->key_prefix,
                    'status' => (string) $credential->status,
                    'lastUsedAt' => optional($credential->last_used_at)->format('Y-m-d H:i:s'),
                    'expiresAt' => optional($credential->expires_at)->format('Y-m-d H:i:s'),
                    'revokedAt' => optional($credential->revoked_at)->format('Y-m-d H:i:s'),
                    'createdAt' => optional($credential->created_at)->format('Y-m-d H:i:s'),
                ];
            })
            ->values()
            ->all();
    }

    public function createCredential(Request $request, int $vendorUserId, int $workspaceId, int $actorUserId, array $input): array
    {
        $policy = $this->resolvePolicyForVendor($vendorUserId);
        if (!(bool) ($policy['enabled'] ?? true)) {
            throw new \RuntimeException('API and Service Access is disabled by team policy.');
        }

        $roleName = trim((string) ($input['roleName'] ?? ''));
        $allowedScopesForRole = $this->allowedApiScopesForRole($workspaceId, $roleName);

        $requestedScopes = collect($input['permissionScopes'] ?? [])
            ->map(fn ($scope) => trim((string) $scope))
            ->filter(fn ($scope) => in_array($scope, $allowedScopesForRole, true))
            ->unique()
            ->values()
            ->all();

        if (count($requestedScopes) === 0) {
            throw new \RuntimeException('At least one API scope allowed by the selected role is required.');
        }

        $requestedWebhookScopes = collect($input['webhookScopes'] ?? [])
            ->map(fn ($scope) => trim((string) $scope))
            ->filter(fn ($scope) => in_array($scope, (array) ($policy['webhookScopesCatalog'] ?? []), true))
            ->unique()
            ->values()
            ->all();

        if (!(bool) ($policy['allowWebhookScopes'] ?? true)) {
            $requestedWebhookScopes = [];
        }

        $serviceAccountCode = trim((string) ($input['serviceAccountCode'] ?? ''));
        if ($serviceAccountCode === '') {
            $serviceAccountCode = 'svc_' . Str::lower(Str::random(10));
        }

        $activeCount = CourierServiceApiCredential::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('service_workspace_id', $workspaceId)
            ->where('service_account_code', $serviceAccountCode)
            ->where('status', CourierServiceApiCredential::STATUS_ACTIVE)
            ->count();

        if ($activeCount >= (int) ($policy['maxActiveKeysPerServiceAccount'] ?? 2)) {
            throw new \RuntimeException('Maximum active keys reached for this service account. Rotate or revoke an existing key first.');
        }

        $ttlDays = max(1, min((int) ($policy['maxTtlDays'] ?? 90), (int) ($input['ttlDays'] ?? (int) ($policy['defaultTtlDays'] ?? 30))));
        $expiresAt = (bool) ($policy['requireExpiry'] ?? true)
            ? now()->addDays($ttlDays)
            : null;

        $rawKey = 'csk_' . Str::random(52);
        $keyHash = hash('sha256', $rawKey);
        $keyPrefix = substr($rawKey, 0, 12);

        $credential = CourierServiceApiCredential::query()->create([
            'vendor_user_id' => $vendorUserId,
            'service_workspace_id' => $workspaceId,
            'created_by_user_id' => $actorUserId,
            'credential_name' => trim((string) ($input['credentialName'] ?? 'Courier Service Credential')),
            'service_account_code' => $serviceAccountCode,
            'role_name' => $roleName,
            'permission_scopes' => $requestedScopes,
            'webhook_scopes' => $requestedWebhookScopes,
            'key_prefix' => $keyPrefix,
            'key_hash' => $keyHash,
            'status' => CourierServiceApiCredential::STATUS_ACTIVE,
            'expires_at' => $expiresAt,
            'policy_snapshot' => [
                'apiServiceAccessControl' => $policy,
                'allowedApiScopesForRole' => $allowedScopesForRole,
            ],
            'metadata' => [
                'created_via' => 'team_api_access_control',
            ],
        ]);

        $this->logCredentialEvent($vendorUserId, $actorUserId, 'courier_team_api_credential_created', $credential, [
            'before_snapshot' => ['status' => null, 'permission_scopes' => [], 'webhook_scopes' => []],
            'after_snapshot' => [
                'status' => CourierServiceApiCredential::STATUS_ACTIVE,
                'role' => $roleName,
                'permission_scopes' => $requestedScopes,
                'webhook_scopes' => $requestedWebhookScopes,
                'expires_at' => optional($expiresAt)->toDateTimeString(),
            ],
        ]);

        return [
            'credential' => $credential,
            'plainApiKey' => $rawKey,
        ];
    }

    public function rotateCredential(Request $request, CourierServiceApiCredential $credential, int $actorUserId, ?int $ttlDays = null): array
    {
        if ($credential->status !== CourierServiceApiCredential::STATUS_ACTIVE) {
            throw new \RuntimeException('Only active credentials can be rotated.');
        }

        $created = $this->createCredential(
            $request,
            (int) $credential->vendor_user_id,
            (int) $credential->service_workspace_id,
            $actorUserId,
            [
                'credentialName' => (string) $credential->credential_name,
                'serviceAccountCode' => (string) $credential->service_account_code,
                'roleName' => (string) $credential->role_name,
                'permissionScopes' => (array) ($credential->permission_scopes ?? []),
                'webhookScopes' => (array) ($credential->webhook_scopes ?? []),
                'ttlDays' => $ttlDays,
            ]
        );

        $newCredential = $created['credential'];
        $newCredential->update(['rotated_from_id' => (int) $credential->id]);

        $credential->update([
            'status' => CourierServiceApiCredential::STATUS_REVOKED,
            'revoked_at' => now(),
            'revoked_by_user_id' => $actorUserId,
        ]);

        $this->logCredentialEvent((int) $credential->vendor_user_id, $actorUserId, 'courier_team_api_credential_rotated', $credential, [
            'new_credential_id' => (int) $newCredential->id,
            'before_snapshot' => ['status' => CourierServiceApiCredential::STATUS_ACTIVE],
            'after_snapshot' => ['status' => CourierServiceApiCredential::STATUS_REVOKED],
        ]);

        return $created;
    }

    public function revokeCredential(CourierServiceApiCredential $credential, int $actorUserId): void
    {
        if ($credential->status !== CourierServiceApiCredential::STATUS_ACTIVE) {
            return;
        }

        $credential->update([
            'status' => CourierServiceApiCredential::STATUS_REVOKED,
            'revoked_at' => now(),
            'revoked_by_user_id' => $actorUserId,
        ]);

        $this->logCredentialEvent((int) $credential->vendor_user_id, $actorUserId, 'courier_team_api_credential_revoked', $credential, [
            'before_snapshot' => ['status' => CourierServiceApiCredential::STATUS_ACTIVE],
            'after_snapshot' => ['status' => CourierServiceApiCredential::STATUS_REVOKED],
        ]);
    }

    public function authenticateApiRequest(Request $request, string $rawKey, string $requiredScope, ?string $requiredWebhookScope = null): array
    {
        if ($rawKey === '') {
            return ['ok' => false, 'status' => 401, 'message' => 'Missing API key.', 'code' => 'api_key_missing'];
        }

        $credential = CourierServiceApiCredential::query()
            ->where('key_hash', hash('sha256', $rawKey))
            ->first();

        if (!$credential) {
            return ['ok' => false, 'status' => 401, 'message' => 'Invalid API key.', 'code' => 'api_key_invalid'];
        }

        if ($credential->status !== CourierServiceApiCredential::STATUS_ACTIVE) {
            return ['ok' => false, 'status' => 403, 'message' => 'API key is not active.', 'code' => 'api_key_inactive', 'credential' => $credential];
        }

        if ($credential->expires_at && now()->gt($credential->expires_at)) {
            $credential->update([
                'status' => CourierServiceApiCredential::STATUS_EXPIRED,
            ]);

            return ['ok' => false, 'status' => 403, 'message' => 'API key expired.', 'code' => 'api_key_expired', 'credential' => $credential];
        }

        $storedScopes = collect($credential->permission_scopes ?? [])->map(fn ($scope) => (string) $scope)->values()->all();
        if (!in_array($requiredScope, $storedScopes, true)) {
            return ['ok' => false, 'status' => 403, 'message' => 'API key scope does not allow this operation.', 'code' => 'api_scope_denied', 'credential' => $credential];
        }

        $allowedByCurrentRole = $this->allowedApiScopesForRole((int) $credential->service_workspace_id, (string) $credential->role_name);
        if (!in_array($requiredScope, $allowedByCurrentRole, true)) {
            return ['ok' => false, 'status' => 403, 'message' => 'Current role policy no longer allows this scope.', 'code' => 'role_policy_scope_denied', 'credential' => $credential];
        }

        if ($requiredWebhookScope) {
            $storedWebhookScopes = collect($credential->webhook_scopes ?? [])->map(fn ($scope) => (string) $scope)->values()->all();
            if (!in_array($requiredWebhookScope, $storedWebhookScopes, true)) {
                return ['ok' => false, 'status' => 403, 'message' => 'Webhook scope denied for this API key.', 'code' => 'webhook_scope_denied', 'credential' => $credential];
            }
        }

        $credential->forceFill(['last_used_at' => now()])->save();

        return ['ok' => true, 'credential' => $credential];
    }

    public function allowedApiScopesForRole(int $workspaceId, string $roleName): array
    {
        $role = Role::query()
            ->where('service_workspace_id', $workspaceId)
            ->where('name', $roleName)
            ->where('guard_name', 'web')
            ->with('permissions:id,name')
            ->first();

        if (!$role) {
            return [];
        }

        $permissions = $role->permissions->pluck('name')->map(fn ($name) => (string) $name)->values()->all();

        return collect(self::SCOPE_PERMISSION_MAP)
            ->filter(fn ($permission) => in_array($permission, $permissions, true))
            ->keys()
            ->values()
            ->all();
    }

    private function logCredentialEvent(int $vendorUserId, int $actorUserId, string $action, CourierServiceApiCredential $credential, array $metadata): void
    {
        try {
            VendorActivityLog::query()->create([
                'vendor_id' => $vendorUserId,
                'admin_id' => $actorUserId,
                'action' => $action,
                'target_type' => 'api_credential',
                'target_id' => (int) $credential->id,
                'description' => 'Courier API credential event recorded.',
                'metadata' => array_merge([
                    'credential_name' => (string) $credential->credential_name,
                    'service_account_code' => (string) $credential->service_account_code,
                    'role_name' => (string) $credential->role_name,
                    'permission_scopes' => (array) ($credential->permission_scopes ?? []),
                    'webhook_scopes' => (array) ($credential->webhook_scopes ?? []),
                    'expires_at' => optional($credential->expires_at)->toDateTimeString(),
                    'target_user_id' => (int) ($credential->created_by_user_id ?? 0),
                ], $metadata),
            ]);
        } catch (\Throwable) {
            // Ignore activity log failures.
        }
    }
}
