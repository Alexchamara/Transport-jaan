<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierTemporaryAccessGrant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Spatie\Permission\PermissionRegistrar;

class CourierTemporaryAccessService
{
    public const GRANT_TYPE_JIT = 'jit_elevation';
    public const GRANT_TYPE_BREAK_GLASS = 'break_glass';

    public const STATUS_PENDING = 'pending';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_REVOKED = 'revoked';
    public const STATUS_EXPIRED = 'expired';

    public function defaultPolicy(): array
    {
        return [
            'enabled' => true,
            'defaultDurationMinutes' => 120,
            'maxDurationMinutes' => 240,
            'requireTicket' => true,
            'requireReason' => true,
            'allowedElevationRoles' => ['courier_admin'],
            'makerChecker' => true,
            'breakGlass' => [
                'enabled' => true,
                'defaultDurationMinutes' => 30,
                'maxDurationMinutes' => 60,
                'requireTicket' => true,
                'requireReason' => true,
                'notifyOwners' => true,
                'notifyRequester' => true,
                'notifyTarget' => true,
                'alertEmails' => array_values(array_filter(array_map('trim', explode(',', (string) config('services.courier.break_glass_alert_emails_csv', ''))))),
                'alertWebhookUrl' => (string) config('services.courier.break_glass_webhook_url', ''),
            ],
        ];
    }

    public function normalizePolicy(array $input): array
    {
        $defaults = $this->defaultPolicy();
        $breakGlass = is_array($input['breakGlass'] ?? null) ? $input['breakGlass'] : [];
        $allowedElevationRoles = collect($input['allowedElevationRoles'] ?? $defaults['allowedElevationRoles'])
            ->map(fn ($role) => trim((string) $role))
            ->filter(fn ($role) => $role !== '')
            ->unique()
            ->values()
            ->all();

        return [
            'enabled' => (bool) ($input['enabled'] ?? $defaults['enabled']),
            'defaultDurationMinutes' => max(15, min(480, (int) ($input['defaultDurationMinutes'] ?? $defaults['defaultDurationMinutes']))),
            'maxDurationMinutes' => max(15, min(720, (int) ($input['maxDurationMinutes'] ?? $defaults['maxDurationMinutes']))),
            'requireTicket' => (bool) ($input['requireTicket'] ?? $defaults['requireTicket']),
            'requireReason' => (bool) ($input['requireReason'] ?? $defaults['requireReason']),
            'allowedElevationRoles' => count($allowedElevationRoles) > 0 ? $allowedElevationRoles : $defaults['allowedElevationRoles'],
            'makerChecker' => (bool) ($input['makerChecker'] ?? $defaults['makerChecker']),
            'breakGlass' => [
                'enabled' => (bool) ($breakGlass['enabled'] ?? $defaults['breakGlass']['enabled']),
                'defaultDurationMinutes' => max(10, min(240, (int) ($breakGlass['defaultDurationMinutes'] ?? $defaults['breakGlass']['defaultDurationMinutes']))),
                'maxDurationMinutes' => max(10, min(240, (int) ($breakGlass['maxDurationMinutes'] ?? $defaults['breakGlass']['maxDurationMinutes']))),
                'requireTicket' => (bool) ($breakGlass['requireTicket'] ?? $defaults['breakGlass']['requireTicket']),
                'requireReason' => (bool) ($breakGlass['requireReason'] ?? $defaults['breakGlass']['requireReason']),
                'notifyOwners' => (bool) ($breakGlass['notifyOwners'] ?? $defaults['breakGlass']['notifyOwners']),
                'notifyRequester' => (bool) ($breakGlass['notifyRequester'] ?? $defaults['breakGlass']['notifyRequester']),
                'notifyTarget' => (bool) ($breakGlass['notifyTarget'] ?? $defaults['breakGlass']['notifyTarget']),
                'alertEmails' => collect($breakGlass['alertEmails'] ?? $defaults['breakGlass']['alertEmails'])
                    ->map(fn ($email) => trim((string) $email))
                    ->filter(fn ($email) => $email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL))
                    ->unique()
                    ->values()
                    ->all(),
                'alertWebhookUrl' => trim((string) ($breakGlass['alertWebhookUrl'] ?? $defaults['breakGlass']['alertWebhookUrl'] ?? '')),
            ],
        ];
    }

    public function requestElevation(
        Request $request,
        int $vendorUserId,
        int $workspaceId,
        array $policy,
        User $targetUser,
        string $ticketRef,
        string $reason,
        string $elevatedRoleName,
        int $durationMinutes
    ): CourierTemporaryAccessGrant {
        $normalized = $this->normalizePolicy($policy);
        $boundedDuration = max(15, min((int) ($normalized['maxDurationMinutes'] ?? 240), $durationMinutes));

        return CourierTemporaryAccessGrant::query()->create([
            'vendor_user_id' => $vendorUserId,
            'service_workspace_id' => $workspaceId,
            'target_user_id' => (int) $targetUser->id,
            'requested_by_user_id' => (int) optional($request->user())->id,
            'grant_type' => self::GRANT_TYPE_JIT,
            'elevated_role_name' => $elevatedRoleName,
            'ticket_ref' => trim($ticketRef),
            'reason' => trim($reason),
            'status' => self::STATUS_PENDING,
            'duration_minutes' => $boundedDuration,
            'grant_context' => [
                'preexisting_role' => $targetUser->hasRole($elevatedRoleName),
            ],
        ]);
    }

    public function approveElevation(Request $request, CourierTemporaryAccessGrant $grant, int $workspaceId, array $policy): array
    {
        $normalized = $this->normalizePolicy($policy);

        if ($grant->status !== self::STATUS_PENDING) {
            return ['ok' => false, 'message' => 'Only pending requests can be approved.'];
        }

        if ((bool) ($normalized['makerChecker'] ?? true)
            && (int) optional($request->user())->id === (int) $grant->requested_by_user_id) {
            return ['ok' => false, 'message' => 'Maker-checker policy prevents self-approval.'];
        }

        $targetUser = User::query()->find($grant->target_user_id);
        if (!$targetUser) {
            return ['ok' => false, 'message' => 'Target user not found for this grant.'];
        }

        app(PermissionRegistrar::class)->setPermissionsTeamId($workspaceId);

        if (!$targetUser->hasRole((string) $grant->elevated_role_name)) {
            $targetUser->assignRole((string) $grant->elevated_role_name);
        }

        $startsAt = now();
        $expiresAt = $startsAt->copy()->addMinutes((int) $grant->duration_minutes);

        $grant->update([
            'status' => self::STATUS_ACTIVE,
            'approved_by_user_id' => (int) optional($request->user())->id,
            'approved_at' => $startsAt,
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,
        ]);

        return ['ok' => true, 'grant' => $grant->fresh(), 'message' => 'Temporary elevation activated successfully.'];
    }

    public function rejectElevation(Request $request, CourierTemporaryAccessGrant $grant, ?string $reason = null): array
    {
        if ($grant->status !== self::STATUS_PENDING) {
            return ['ok' => false, 'message' => 'Only pending requests can be rejected.'];
        }

        $grant->update([
            'status' => self::STATUS_REJECTED,
            'rejected_by_user_id' => (int) optional($request->user())->id,
            'rejected_at' => now(),
            'grant_context' => array_merge(is_array($grant->grant_context) ? $grant->grant_context : [], [
                'rejection_reason' => trim((string) $reason),
            ]),
        ]);

        return ['ok' => true, 'grant' => $grant->fresh(), 'message' => 'Temporary elevation request rejected.'];
    }

    public function activateBreakGlass(
        Request $request,
        int $vendorUserId,
        int $workspaceId,
        array $policy,
        User $targetUser,
        string $ticketRef,
        string $reason,
        int $durationMinutes,
        string $elevatedRoleName = 'courier_admin'
    ): array {
        $normalized = $this->normalizePolicy($policy);
        $bgPolicy = is_array($normalized['breakGlass'] ?? null) ? $normalized['breakGlass'] : [];
        $boundedDuration = max(10, min((int) ($bgPolicy['maxDurationMinutes'] ?? 60), $durationMinutes));

        $grant = CourierTemporaryAccessGrant::query()->create([
            'vendor_user_id' => $vendorUserId,
            'service_workspace_id' => $workspaceId,
            'target_user_id' => (int) $targetUser->id,
            'requested_by_user_id' => (int) optional($request->user())->id,
            'approved_by_user_id' => (int) optional($request->user())->id,
            'grant_type' => self::GRANT_TYPE_BREAK_GLASS,
            'elevated_role_name' => $elevatedRoleName,
            'ticket_ref' => trim($ticketRef),
            'reason' => trim($reason),
            'status' => self::STATUS_ACTIVE,
            'duration_minutes' => $boundedDuration,
            'starts_at' => now(),
            'approved_at' => now(),
            'expires_at' => now()->addMinutes($boundedDuration),
            'grant_context' => [
                'preexisting_role' => $targetUser->hasRole($elevatedRoleName),
                'break_glass' => true,
            ],
        ]);

        app(PermissionRegistrar::class)->setPermissionsTeamId($workspaceId);
        if (!$targetUser->hasRole($elevatedRoleName)) {
            $targetUser->assignRole($elevatedRoleName);
        }

        return ['ok' => true, 'grant' => $grant->fresh(), 'message' => 'Break-glass access activated.'];
    }

    public function revokeGrant(
        CourierTemporaryAccessGrant $grant,
        int $workspaceId,
        ?int $revokedByUserId = null,
        ?string $reason = null,
        string $status = self::STATUS_REVOKED
    ): void {
        if (!in_array($grant->status, [self::STATUS_ACTIVE, self::STATUS_PENDING], true)) {
            return;
        }

        $targetUser = User::query()->find($grant->target_user_id);
        $elevatedRole = (string) ($grant->elevated_role_name ?? '');
        $context = is_array($grant->grant_context) ? $grant->grant_context : [];
        $preExistingRole = (bool) ($context['preexisting_role'] ?? false);

        if ($targetUser && $elevatedRole !== '' && !$preExistingRole) {
            $hasParallelActiveGrant = CourierTemporaryAccessGrant::query()
                ->where('id', '!=', $grant->id)
                ->where('vendor_user_id', $grant->vendor_user_id)
                ->where('target_user_id', $grant->target_user_id)
                ->where('elevated_role_name', $elevatedRole)
                ->where('status', self::STATUS_ACTIVE)
                ->where(function ($query) {
                    $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->exists();

            if (!$hasParallelActiveGrant) {
                app(PermissionRegistrar::class)->setPermissionsTeamId($workspaceId);
                $targetUser->removeRole($elevatedRole);
            }
        }

        $grant->update([
            'status' => $status,
            'revoked_by_user_id' => $revokedByUserId,
            'revoked_at' => now(),
            'grant_context' => array_merge($context, [
                'revoke_reason' => trim((string) $reason),
            ]),
        ]);
    }

    public function revokeExpiredForWorkspace(int $vendorUserId, ?int $workspaceId): int
    {
        $query = CourierTemporaryAccessGrant::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('status', self::STATUS_ACTIVE)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', Carbon::now());

        if ($workspaceId !== null) {
            $query->where(function ($builder) use ($workspaceId) {
                $builder->whereNull('service_workspace_id')
                    ->orWhere('service_workspace_id', $workspaceId);
            });
        }

        $expired = $query->orderBy('id')->get();

        foreach ($expired as $grant) {
            $effectiveWorkspace = (int) ($grant->service_workspace_id ?: $workspaceId ?: 0);
            if ($effectiveWorkspace <= 0) {
                continue;
            }
            $this->revokeGrant($grant, $effectiveWorkspace, null, 'Auto-revoked on expiry.', self::STATUS_EXPIRED);
        }

        return $expired->count();
    }
}
