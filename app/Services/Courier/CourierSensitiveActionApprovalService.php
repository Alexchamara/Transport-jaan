<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierSensitiveActionApproval;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CourierSensitiveActionApprovalService
{
    public const ACTION_HIGH_VALUE_CANCELLATION = 'high_value_cancellation';
    public const ACTION_REFUND = 'refund';
    public const ACTION_OWNERSHIP_TRANSFER = 'ownership_transfer';
    public const ACTION_CLIENT_LIST_EXPORT = 'client_list_export';

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_EXECUTED = 'executed';

    public function defaultPolicy(): array
    {
        return [
            'enabled' => true,
            'makerChecker' => true,
            'approvalTtlMinutes' => 240,
            'sensitiveActions' => [
                self::ACTION_HIGH_VALUE_CANCELLATION => [
                    'enabled' => true,
                    'minAmount' => 50000,
                    'requiredApprovals' => 1,
                ],
                self::ACTION_REFUND => [
                    'enabled' => true,
                    'level1MinAmount' => 25000,
                    'level2MinAmount' => 100000,
                    'requiredApprovalsLevel1' => 1,
                    'requiredApprovalsLevel2' => 2,
                ],
                self::ACTION_OWNERSHIP_TRANSFER => [
                    'enabled' => true,
                    'requiredApprovals' => 2,
                ],
                self::ACTION_CLIENT_LIST_EXPORT => [
                    'enabled' => true,
                    'minRows' => 100,
                    'requiredApprovals' => 1,
                ],
            ],
        ];
    }

    public function normalizePolicy(array $input): array
    {
        $defaults = $this->defaultPolicy();
        $actions = is_array($input['sensitiveActions'] ?? null) ? $input['sensitiveActions'] : [];

        return [
            'enabled' => (bool) ($input['enabled'] ?? $defaults['enabled']),
            'makerChecker' => (bool) ($input['makerChecker'] ?? $defaults['makerChecker']),
            'approvalTtlMinutes' => max(10, min(10080, (int) ($input['approvalTtlMinutes'] ?? $defaults['approvalTtlMinutes']))),
            'sensitiveActions' => [
                self::ACTION_HIGH_VALUE_CANCELLATION => [
                    'enabled' => (bool) ($actions[self::ACTION_HIGH_VALUE_CANCELLATION]['enabled'] ?? $defaults['sensitiveActions'][self::ACTION_HIGH_VALUE_CANCELLATION]['enabled']),
                    'minAmount' => max(0, (float) ($actions[self::ACTION_HIGH_VALUE_CANCELLATION]['minAmount'] ?? $defaults['sensitiveActions'][self::ACTION_HIGH_VALUE_CANCELLATION]['minAmount'])),
                    'requiredApprovals' => max(1, min(3, (int) ($actions[self::ACTION_HIGH_VALUE_CANCELLATION]['requiredApprovals'] ?? $defaults['sensitiveActions'][self::ACTION_HIGH_VALUE_CANCELLATION]['requiredApprovals']))),
                ],
                self::ACTION_REFUND => [
                    'enabled' => (bool) ($actions[self::ACTION_REFUND]['enabled'] ?? $defaults['sensitiveActions'][self::ACTION_REFUND]['enabled']),
                    'level1MinAmount' => max(0, (float) ($actions[self::ACTION_REFUND]['level1MinAmount'] ?? $defaults['sensitiveActions'][self::ACTION_REFUND]['level1MinAmount'])),
                    'level2MinAmount' => max(0, (float) ($actions[self::ACTION_REFUND]['level2MinAmount'] ?? $defaults['sensitiveActions'][self::ACTION_REFUND]['level2MinAmount'])),
                    'requiredApprovalsLevel1' => max(1, min(3, (int) ($actions[self::ACTION_REFUND]['requiredApprovalsLevel1'] ?? $defaults['sensitiveActions'][self::ACTION_REFUND]['requiredApprovalsLevel1']))),
                    'requiredApprovalsLevel2' => max(1, min(3, (int) ($actions[self::ACTION_REFUND]['requiredApprovalsLevel2'] ?? $defaults['sensitiveActions'][self::ACTION_REFUND]['requiredApprovalsLevel2']))),
                ],
                self::ACTION_OWNERSHIP_TRANSFER => [
                    'enabled' => (bool) ($actions[self::ACTION_OWNERSHIP_TRANSFER]['enabled'] ?? $defaults['sensitiveActions'][self::ACTION_OWNERSHIP_TRANSFER]['enabled']),
                    'requiredApprovals' => max(1, min(3, (int) ($actions[self::ACTION_OWNERSHIP_TRANSFER]['requiredApprovals'] ?? $defaults['sensitiveActions'][self::ACTION_OWNERSHIP_TRANSFER]['requiredApprovals']))),
                ],
                self::ACTION_CLIENT_LIST_EXPORT => [
                    'enabled' => (bool) ($actions[self::ACTION_CLIENT_LIST_EXPORT]['enabled'] ?? $defaults['sensitiveActions'][self::ACTION_CLIENT_LIST_EXPORT]['enabled']),
                    'minRows' => max(1, (int) ($actions[self::ACTION_CLIENT_LIST_EXPORT]['minRows'] ?? $defaults['sensitiveActions'][self::ACTION_CLIENT_LIST_EXPORT]['minRows'])),
                    'requiredApprovals' => max(1, min(3, (int) ($actions[self::ACTION_CLIENT_LIST_EXPORT]['requiredApprovals'] ?? $defaults['sensitiveActions'][self::ACTION_CLIENT_LIST_EXPORT]['requiredApprovals']))),
                ],
            ],
        ];
    }

    public function resolveRequirement(array $policy, string $actionKey, array $context = []): array
    {
        $normalized = $this->normalizePolicy($policy);
        $base = [
            'required' => false,
            'requiredApprovals' => 0,
            'thresholdLevel' => null,
            'amount' => isset($context['amount']) ? (float) $context['amount'] : null,
            'reason' => null,
        ];

        if (!(bool) ($normalized['enabled'] ?? true)) {
            return $base;
        }

        $actionPolicy = $normalized['sensitiveActions'][$actionKey] ?? null;
        if (!is_array($actionPolicy) || !(bool) ($actionPolicy['enabled'] ?? false)) {
            return $base;
        }

        if ($actionKey === self::ACTION_HIGH_VALUE_CANCELLATION) {
            $amount = (float) ($context['amount'] ?? 0);
            $threshold = (float) ($actionPolicy['minAmount'] ?? 0);
            if ($amount >= $threshold) {
                return [
                    'required' => true,
                    'requiredApprovals' => (int) ($actionPolicy['requiredApprovals'] ?? 1),
                    'thresholdLevel' => 'high_value',
                    'amount' => $amount,
                    'reason' => 'High-value cancellation requires approval.',
                ];
            }

            return $base;
        }

        if ($actionKey === self::ACTION_REFUND) {
            $amount = (float) ($context['amount'] ?? 0);
            $l1 = (float) ($actionPolicy['level1MinAmount'] ?? 0);
            $l2 = (float) ($actionPolicy['level2MinAmount'] ?? 0);

            if ($amount >= $l2) {
                return [
                    'required' => true,
                    'requiredApprovals' => (int) ($actionPolicy['requiredApprovalsLevel2'] ?? 2),
                    'thresholdLevel' => 'level_2',
                    'amount' => $amount,
                    'reason' => 'High-value refund requires multi-level approval.',
                ];
            }

            if ($amount >= $l1) {
                return [
                    'required' => true,
                    'requiredApprovals' => (int) ($actionPolicy['requiredApprovalsLevel1'] ?? 1),
                    'thresholdLevel' => 'level_1',
                    'amount' => $amount,
                    'reason' => 'Refund requires approval above threshold.',
                ];
            }

            return $base;
        }

        if ($actionKey === self::ACTION_CLIENT_LIST_EXPORT) {
            $rows = max(0, (int) ($context['rowCount'] ?? 0));
            $threshold = max(1, (int) ($actionPolicy['minRows'] ?? 100));
            if ($rows >= $threshold) {
                return [
                    'required' => true,
                    'requiredApprovals' => (int) ($actionPolicy['requiredApprovals'] ?? 1),
                    'thresholdLevel' => 'full_export',
                    'amount' => null,
                    'reason' => 'Full client list export requires approval.',
                ];
            }

            return $base;
        }

        if ($actionKey === self::ACTION_OWNERSHIP_TRANSFER) {
            return [
                'required' => true,
                'requiredApprovals' => (int) ($actionPolicy['requiredApprovals'] ?? 2),
                'thresholdLevel' => 'ownership',
                'amount' => null,
                'reason' => 'Ownership transfer requires dual control approval.',
            ];
        }

        return $base;
    }

    public function ensureApprovedOrQueue(
        Request $request,
        int $vendorUserId,
        ?int $workspaceId,
        array $policy,
        string $actionKey,
        array $context = []
    ): array {
        $requirement = $this->resolveRequirement($policy, $actionKey, $context);

        if (!(bool) ($requirement['required'] ?? false)) {
            return [
                'ok' => true,
                'status' => 'not_required',
                'approval' => null,
                'requirement' => $requirement,
                'message' => null,
            ];
        }

        $signature = $this->buildSignature($vendorUserId, $workspaceId, $actionKey, $context);
        $now = now();

        $this->expirePending($vendorUserId, $signature, $now);

        $existing = CourierSensitiveActionApproval::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('request_signature', $signature)
            ->whereIn('status', [self::STATUS_PENDING, self::STATUS_APPROVED])
            ->orderByDesc('id')
            ->first();

        if ($existing && $existing->status === self::STATUS_APPROVED && (int) $existing->approved_count >= (int) $existing->required_approvals) {
            return [
                'ok' => true,
                'status' => 'approved',
                'approval' => $existing,
                'requirement' => $requirement,
                'message' => null,
            ];
        }

        if (!$existing) {
            $ttlMinutes = max(10, (int) ($this->normalizePolicy($policy)['approvalTtlMinutes'] ?? 240));
            $existing = CourierSensitiveActionApproval::query()->create([
                'vendor_user_id' => $vendorUserId,
                'service_workspace_id' => $workspaceId,
                'action_key' => $actionKey,
                'resource_type' => isset($context['resourceType']) ? (string) $context['resourceType'] : null,
                'resource_id' => isset($context['resourceId']) ? (int) $context['resourceId'] : null,
                'request_signature' => $signature,
                'requested_by_user_id' => (int) optional($request->user())->id,
                'required_approvals' => (int) ($requirement['requiredApprovals'] ?? 1),
                'approved_count' => 0,
                'approver_user_ids' => [],
                'amount' => $requirement['amount'],
                'threshold_level' => $requirement['thresholdLevel'],
                'status' => self::STATUS_PENDING,
                'reason' => (string) ($context['reason'] ?? $requirement['reason']),
                'context' => $context,
                'expires_at' => $now->copy()->addMinutes($ttlMinutes),
            ]);
        }

        return [
            'ok' => false,
            'status' => 'pending',
            'approval' => $existing,
            'requirement' => $requirement,
            'message' => 'Sensitive action requires approval. Request #' . $existing->id . ' is pending (' . (int) $existing->approved_count . '/' . (int) $existing->required_approvals . ').',
        ];
    }

    public function approveRequest(Request $request, CourierSensitiveActionApproval $approval, array $policy): array
    {
        $normalized = $this->normalizePolicy($policy);
        $actorId = (int) optional($request->user())->id;

        if ($approval->status !== self::STATUS_PENDING) {
            return ['ok' => false, 'message' => 'Only pending requests can be approved.'];
        }

        if ($approval->expires_at && Carbon::parse($approval->expires_at)->lt(now())) {
            $approval->update(['status' => self::STATUS_EXPIRED]);
            return ['ok' => false, 'message' => 'Approval request already expired.'];
        }

        if ((bool) ($normalized['makerChecker'] ?? true) && $actorId === (int) $approval->requested_by_user_id) {
            return ['ok' => false, 'message' => 'Maker-checker policy prevents self-approval.'];
        }

        $approverIds = collect($approval->approver_user_ids ?? [])->map(fn ($id) => (int) $id)->filter(fn ($id) => $id > 0)->values();
        if ($approverIds->contains($actorId)) {
            return ['ok' => false, 'message' => 'You have already approved this request.'];
        }

        $approverIds->push($actorId);

        $approvedCount = $approverIds->count();
        $status = $approvedCount >= (int) $approval->required_approvals
            ? self::STATUS_APPROVED
            : self::STATUS_PENDING;

        $approval->update([
            'approver_user_ids' => $approverIds->unique()->values()->all(),
            'approved_count' => $approvedCount,
            'approved_by_user_id' => $actorId,
            'approved_at' => $status === self::STATUS_APPROVED ? now() : null,
            'status' => $status,
        ]);

        return [
            'ok' => true,
            'status' => $status,
            'message' => $status === self::STATUS_APPROVED
                ? 'Approval completed and request is now executable.'
                : 'Approval recorded (' . $approvedCount . '/' . (int) $approval->required_approvals . ').',
            'approval' => $approval->fresh(),
        ];
    }

    public function rejectRequest(Request $request, CourierSensitiveActionApproval $approval, ?string $reason = null): array
    {
        if ($approval->status !== self::STATUS_PENDING) {
            return ['ok' => false, 'message' => 'Only pending requests can be rejected.'];
        }

        $approval->update([
            'status' => self::STATUS_REJECTED,
            'rejected_by_user_id' => (int) optional($request->user())->id,
            'rejected_at' => now(),
            'reason' => trim((string) ($reason ?: $approval->reason)),
        ]);

        return ['ok' => true, 'message' => 'Approval request rejected.', 'approval' => $approval->fresh()];
    }

    public function markExecuted(CourierSensitiveActionApproval $approval): void
    {
        $approval->update([
            'status' => self::STATUS_EXECUTED,
            'executed_at' => now(),
        ]);
    }

    private function expirePending(int $vendorUserId, string $signature, Carbon $now): void
    {
        CourierSensitiveActionApproval::query()
            ->where('vendor_user_id', $vendorUserId)
            ->where('request_signature', $signature)
            ->where('status', self::STATUS_PENDING)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', $now)
            ->update(['status' => self::STATUS_EXPIRED]);
    }

    private function buildSignature(int $vendorUserId, ?int $workspaceId, string $actionKey, array $context): string
    {
        $fingerprint = [
            'vendor' => $vendorUserId,
            'workspace' => $workspaceId,
            'action' => $actionKey,
            'resourceType' => (string) ($context['resourceType'] ?? ''),
            'resourceId' => (int) ($context['resourceId'] ?? 0),
            'rowCount' => (int) ($context['rowCount'] ?? 0),
            'amountBand' => $this->amountBand(isset($context['amount']) ? (float) $context['amount'] : null),
            'subject' => (string) ($context['subject'] ?? ''),
            'subjectList' => collect($context['subjectIds'] ?? [])->map(fn ($id) => (int) $id)->filter(fn ($id) => $id > 0)->sort()->values()->all(),
        ];

        return sha1(json_encode($fingerprint));
    }

    private function amountBand(?float $amount): string
    {
        if ($amount === null) {
            return 'none';
        }

        if ($amount < 25000) {
            return 'lt_25k';
        }

        if ($amount < 100000) {
            return '25k_100k';
        }

        if ($amount < 500000) {
            return '100k_500k';
        }

        return 'gte_500k';
    }
}
