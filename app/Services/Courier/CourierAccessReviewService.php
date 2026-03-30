<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierAccessReviewCertification;
use App\Models\Courier\VendorCourierSetting;
use App\Models\User;
use App\Models\VendorActivityLog;
use App\Models\VendorUserMembership;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

class CourierAccessReviewService
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_CERTIFIED = 'certified';
    public const STATUS_REVOKED = 'revoked';
    public const STATUS_AUTO_DISABLED = 'auto_disabled';

    public function defaultPolicy(): array
    {
        return [
            'enabled' => true,
            'reviewFrequency' => 'monthly',
            'reviewDueDays' => 7,
            'requireManagerCertification' => true,
            'autoDisableStaleAccounts' => true,
            'staleAccountDays' => 45,
            'alertDormantPrivilegedUsers' => true,
            'dormantPrivilegedDays' => 21,
            'privilegedRoles' => ['courier_owner', 'courier_admin', 'courier_finance'],
        ];
    }

    public function normalizePolicy(array $input): array
    {
        $defaults = $this->defaultPolicy();
        $frequency = (string) ($input['reviewFrequency'] ?? $defaults['reviewFrequency']);

        return [
            'enabled' => (bool) ($input['enabled'] ?? $defaults['enabled']),
            'reviewFrequency' => in_array($frequency, ['monthly', 'quarterly'], true) ? $frequency : $defaults['reviewFrequency'],
            'reviewDueDays' => max(1, min(30, (int) ($input['reviewDueDays'] ?? $defaults['reviewDueDays']))),
            'requireManagerCertification' => (bool) ($input['requireManagerCertification'] ?? $defaults['requireManagerCertification']),
            'autoDisableStaleAccounts' => (bool) ($input['autoDisableStaleAccounts'] ?? $defaults['autoDisableStaleAccounts']),
            'staleAccountDays' => max(7, min(365, (int) ($input['staleAccountDays'] ?? $defaults['staleAccountDays']))),
            'alertDormantPrivilegedUsers' => (bool) ($input['alertDormantPrivilegedUsers'] ?? $defaults['alertDormantPrivilegedUsers']),
            'dormantPrivilegedDays' => max(3, min(180, (int) ($input['dormantPrivilegedDays'] ?? $defaults['dormantPrivilegedDays']))),
            'privilegedRoles' => collect($input['privilegedRoles'] ?? $defaults['privilegedRoles'])
                ->map(fn ($role) => trim((string) $role))
                ->filter()
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
        $policy = is_array($team['accessReviewControl'] ?? null) ? $team['accessReviewControl'] : [];

        return $this->normalizePolicy($policy);
    }

    public function runLifecycle(int $vendorUserId, int $workspaceId, ?int $actorUserId = null): array
    {
        $policy = $this->resolvePolicyForVendor($vendorUserId);
        if (!(bool) ($policy['enabled'] ?? true)) {
            return ['created' => 0, 'disabled' => 0, 'alerts' => 0];
        }

        $created = $this->ensureCurrentCycleReviews($vendorUserId, $workspaceId, $policy);
        $disabled = $this->autoDisableStaleAccounts($vendorUserId, $workspaceId, $policy, $actorUserId);
        $alerts = $this->alertDormantPrivilegedUsers($vendorUserId, $workspaceId, $policy, $actorUserId);

        return [
            'created' => $created,
            'disabled' => $disabled,
            'alerts' => $alerts,
        ];
    }

    public function listPendingForWorkspace(int $vendorUserId, int $workspaceId): array
    {
        return CourierAccessReviewCertification::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where(function ($query) use ($workspaceId) {
                $query->whereNull('service_workspace_id')->orWhere('service_workspace_id', $workspaceId);
            })
            ->where('status', self::STATUS_PENDING)
            ->with(['subjectUser:id,name,email', 'reviewer:id,name,email'])
            ->orderBy('due_at')
            ->orderByDesc('id')
            ->limit(250)
            ->get()
            ->map(function (CourierAccessReviewCertification $item) {
                return [
                    'id' => (int) $item->id,
                    'cycleType' => (string) $item->cycle_type,
                    'cycleKey' => (string) $item->cycle_key,
                    'status' => (string) $item->status,
                    'dueAt' => optional($item->due_at)->format('Y-m-d H:i:s'),
                    'lastAccessAt' => optional($item->last_access_at)->format('Y-m-d H:i:s'),
                    'subjectUser' => [
                        'id' => (int) ($item->subjectUser?->id ?? 0),
                        'name' => (string) ($item->subjectUser?->name ?? ''),
                        'email' => (string) ($item->subjectUser?->email ?? ''),
                    ],
                    'reviewer' => [
                        'id' => (int) ($item->reviewer?->id ?? 0),
                        'name' => (string) ($item->reviewer?->name ?? ''),
                        'email' => (string) ($item->reviewer?->email ?? ''),
                    ],
                    'snapshot' => is_array($item->snapshot) ? $item->snapshot : [],
                ];
            })
            ->values()
            ->all();
    }

    public function certify(CourierAccessReviewCertification $item, int $reviewerUserId, bool $keepAccess, ?string $notes = null): array
    {
        if ($item->status !== self::STATUS_PENDING) {
            return ['ok' => false, 'message' => 'Only pending certification items can be processed.'];
        }

        $membership = VendorUserMembership::query()
            ->where('vendor_user_id', (int) $item->vendor_user_id)
            ->where('user_id', (int) $item->subject_user_id)
            ->first();

        if (!$membership) {
            return ['ok' => false, 'message' => 'Subject membership not found.'];
        }

        $status = $keepAccess ? self::STATUS_CERTIFIED : self::STATUS_REVOKED;

        DB::transaction(function () use ($item, $reviewerUserId, $keepAccess, $notes, $membership, $status) {
            $item->update([
                'status' => $status,
                'reviewer_user_id' => $reviewerUserId,
                'certified_at' => now(),
                'notes' => trim((string) $notes),
            ]);

            if (!$keepAccess) {
                $membership->status = 'suspended';
                $membership->suspended_at = now();
                $membership->suspended_by_user_id = $reviewerUserId;
                $membership->save();

                DB::table('sessions')
                    ->where('user_id', (int) $membership->user_id)
                    ->delete();
            }
        });

        return [
            'ok' => true,
            'status' => $status,
            'item' => $item->fresh(),
            'message' => $keepAccess
                ? 'Access certification confirmed successfully.'
                : 'Access certification completed. User access has been revoked.',
        ];
    }

    private function ensureCurrentCycleReviews(int $vendorUserId, int $workspaceId, array $policy): int
    {
        if (!(bool) ($policy['requireManagerCertification'] ?? true)) {
            return 0;
        }

        [$cycleType, $cycleKey] = $this->resolveCycle((string) ($policy['reviewFrequency'] ?? 'monthly'));
        $dueAt = now()->addDays((int) ($policy['reviewDueDays'] ?? 7));

        $memberships = VendorUserMembership::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('status', 'active')
            ->get();

        $created = 0;

        foreach ($memberships as $membership) {
            $subjectUserId = (int) $membership->user_id;
            $exists = CourierAccessReviewCertification::query()
                ->where('vendor_user_id', $vendorUserId)
                ->where(function ($query) use ($workspaceId) {
                    $query->whereNull('service_workspace_id')->orWhere('service_workspace_id', $workspaceId);
                })
                ->where('subject_user_id', $subjectUserId)
                ->where('cycle_key', $cycleKey)
                ->exists();

            if ($exists) {
                continue;
            }

            CourierAccessReviewCertification::query()->create([
                'vendor_user_id' => $vendorUserId,
                'service_workspace_id' => $workspaceId,
                'subject_user_id' => $subjectUserId,
                'cycle_type' => $cycleType,
                'cycle_key' => $cycleKey,
                'status' => self::STATUS_PENDING,
                'due_at' => $dueAt,
                'last_access_at' => $this->resolveLastAccessAt($subjectUserId),
                'snapshot' => [
                    'membership_role' => (string) ($membership->membership_role ?? ''),
                    'status' => (string) ($membership->status ?? ''),
                ],
            ]);

            $created++;
        }

        return $created;
    }

    private function autoDisableStaleAccounts(int $vendorUserId, int $workspaceId, array $policy, ?int $actorUserId = null): int
    {
        if (!(bool) ($policy['autoDisableStaleAccounts'] ?? true)) {
            return 0;
        }

        $threshold = now()->subDays((int) ($policy['staleAccountDays'] ?? 45));
        $memberships = VendorUserMembership::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('status', 'active')
            ->where('membership_role', '!=', 'owner')
            ->get();

        $disabled = 0;

        foreach ($memberships as $membership) {
            $lastAccess = $this->resolveLastAccessAt((int) $membership->user_id);
            if ($lastAccess && $lastAccess->gt($threshold)) {
                continue;
            }

            DB::transaction(function () use ($membership, $actorUserId) {
                $membership->status = 'suspended';
                $membership->suspended_at = now();
                $membership->suspended_by_user_id = $actorUserId;
                $membership->save();

                DB::table('sessions')
                    ->where('user_id', (int) $membership->user_id)
                    ->delete();
            });

            CourierAccessReviewCertification::query()->updateOrCreate(
                [
                    'vendor_user_id' => (int) $membership->vendor_user_id,
                    'service_workspace_id' => $workspaceId,
                    'subject_user_id' => (int) $membership->user_id,
                    'cycle_key' => 'stale-' . now()->format('Y-m-d'),
                ],
                [
                    'cycle_type' => 'stale_account',
                    'status' => self::STATUS_AUTO_DISABLED,
                    'due_at' => now(),
                    'certified_at' => now(),
                    'reviewer_user_id' => $actorUserId,
                    'last_access_at' => $lastAccess,
                    'notes' => 'Auto-disabled by stale account policy.',
                ]
            );

            VendorActivityLog::query()->create([
                'vendor_id' => (int) $membership->vendor_user_id,
                'admin_id' => $actorUserId,
                'action' => 'courier_team_stale_account_auto_disabled',
                'target_type' => 'user',
                'target_id' => (int) $membership->user_id,
                'description' => 'Team member access auto-disabled due to stale account policy.',
                'metadata' => [
                    'workspace_id' => $workspaceId,
                    'stale_threshold_days' => (int) ($policy['staleAccountDays'] ?? 45),
                ],
            ]);

            $disabled++;
        }

        return $disabled;
    }

    private function alertDormantPrivilegedUsers(int $vendorUserId, int $workspaceId, array $policy, ?int $actorUserId = null): int
    {
        if (!(bool) ($policy['alertDormantPrivilegedUsers'] ?? true)) {
            return 0;
        }

        $threshold = now()->subDays((int) ($policy['dormantPrivilegedDays'] ?? 21));
        $privilegedRoles = collect($policy['privilegedRoles'] ?? [])->map(fn ($role) => (string) $role)->filter()->values()->all();

        $memberships = VendorUserMembership::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('status', 'active')
            ->get();

        $alerts = 0;

        foreach ($memberships as $membership) {
            $subjectUserId = (int) $membership->user_id;
            $subjectUser = User::query()->find($subjectUserId);
            if (!$subjectUser) {
                continue;
            }

            if (!$this->hasPrivilegedRole($subjectUser, $workspaceId, $privilegedRoles)) {
                continue;
            }

            $lastAccess = $this->resolveLastAccessAt($subjectUserId);
            if ($lastAccess && $lastAccess->gt($threshold)) {
                continue;
            }

            $alreadyAlerted = VendorActivityLog::query()
                ->where('vendor_id', $vendorUserId)
                ->where('action', 'courier_team_dormant_privileged_alert')
                ->where('target_type', 'user')
                ->where('target_id', $subjectUserId)
                ->where('created_at', '>=', now()->subDay())
                ->exists();

            if ($alreadyAlerted) {
                continue;
            }

            VendorActivityLog::query()->create([
                'vendor_id' => $vendorUserId,
                'admin_id' => $actorUserId,
                'action' => 'courier_team_dormant_privileged_alert',
                'target_type' => 'user',
                'target_id' => $subjectUserId,
                'description' => 'Dormant privileged team user detected.',
                'metadata' => [
                    'workspace_id' => $workspaceId,
                    'dormant_threshold_days' => (int) ($policy['dormantPrivilegedDays'] ?? 21),
                    'last_access_at' => optional($lastAccess)->toDateTimeString(),
                ],
            ]);

            CourierAccessReviewCertification::query()
                ->where('vendor_user_id', $vendorUserId)
                ->where('service_workspace_id', $workspaceId)
                ->where('subject_user_id', $subjectUserId)
                ->where('status', self::STATUS_PENDING)
                ->latest('id')
                ->limit(1)
                ->update(['alerted_dormant_at' => now()]);

            $alerts++;
        }

        return $alerts;
    }

    private function resolveCycle(string $frequency): array
    {
        if ($frequency === 'quarterly') {
            $quarter = (int) ceil(now()->month / 3);
            return ['quarterly', now()->format('Y') . '-Q' . $quarter];
        }

        return ['monthly', now()->format('Y-m')];
    }

    private function resolveLastAccessAt(int $userId): ?Carbon
    {
        $last = DB::table('sessions')
            ->where('user_id', $userId)
            ->max('last_activity');

        if ($last) {
            return Carbon::createFromTimestamp((int) $last);
        }

        $user = User::query()->find($userId);
        if ($user?->created_at) {
            return Carbon::parse($user->created_at);
        }

        return null;
    }

    private function hasPrivilegedRole(User $user, int $workspaceId, array $privilegedRoles): bool
    {
        app(PermissionRegistrar::class)->setPermissionsTeamId($workspaceId);

        return $user->roles
            ->pluck('name')
            ->map(fn ($role) => (string) $role)
            ->intersect($privilegedRoles)
            ->isNotEmpty();
    }
}
