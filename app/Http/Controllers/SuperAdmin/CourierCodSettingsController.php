<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Courier\CourierCodSettlementSetting;
use App\Models\Courier\CourierVendorCodCapability;
use App\Models\Courier\CourierVendorCodCapabilityAudit;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class CourierCodSettingsController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:all,pending,approved,rejected,not_requested'],
            'category' => ['nullable', 'string', 'in:all,domestic,international,logistic'],
            'search' => ['nullable', 'string', 'max:120'],
        ]);

        $statusFilter = (string) ($validated['status'] ?? 'all');
        $categoryFilterRaw = (string) ($validated['category'] ?? 'all');
        $categoryFilter = $categoryFilterRaw === 'all'
            ? 'all'
            : CourierVendorCodCapability::normalizeCategory($categoryFilterRaw);
        $search = trim((string) ($validated['search'] ?? ''));

        $settings = CourierCodSettlementSetting::query()->firstOrCreate(
            ['id' => 1],
            CourierCodSettlementSetting::defaults()
        );

        $query = CourierVendorCodCapability::query()
            ->with(['vendor:id,name,email,status', 'requester:id,name', 'reviewer:id,name'])
            ->orderByRaw("case when status = 'pending' then 0 when status = 'rejected' then 1 when status = 'approved' then 2 else 3 end")
            ->orderByDesc('requested_at')
            ->orderByDesc('id');

        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        if ($categoryFilter !== 'all') {
            $query->where('category', $categoryFilter);
        }

        if ($search !== '') {
            $query->whereHas('vendor', function (Builder $builder) use ($search) {
                $builder
                    ->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        $paginator = $query->paginate(20)->withQueryString();

        $capabilityIds = collect($paginator->items())
            ->map(static fn (CourierVendorCodCapability $capability) => (int) $capability->id)
            ->filter(static fn (int $id) => $id > 0)
            ->values();

        $auditEventsByCapability = collect();
        $auditEventCountByCapability = [];
        $auditIntegrityByCapability = [];

        if ($capabilityIds->isNotEmpty()) {
            $audits = CourierVendorCodCapabilityAudit::query()
                ->with(['actor:id,name'])
                ->whereIn('courier_vendor_cod_capability_id', $capabilityIds->all())
                ->orderByDesc('id')
                ->get();

            $auditEventCountByCapability = $audits
                ->groupBy(static fn (CourierVendorCodCapabilityAudit $audit) => (int) $audit->courier_vendor_cod_capability_id)
                ->map(static fn ($events) => $events->count())
                ->all();

            $auditEventsByCapability = $audits
                ->groupBy(static fn (CourierVendorCodCapabilityAudit $audit) => (int) $audit->courier_vendor_cod_capability_id)
                ->map(fn ($events) => $events
                    ->take(8)
                    ->map(fn (CourierVendorCodCapabilityAudit $audit) => $this->serializeCapabilityAuditEvent($audit))
                    ->values());

            $auditIntegrityByCapability = $audits
                ->groupBy(static fn (CourierVendorCodCapabilityAudit $audit) => (int) $audit->courier_vendor_cod_capability_id)
                ->map(function (Collection $events) {
                    $integrityIndex = $this->buildAuditIntegrityIndex(
                        $events
                            ->sortBy(static fn (CourierVendorCodCapabilityAudit $audit) => (int) $audit->id)
                            ->values()
                    );

                    return $integrityIndex['summary'];
                })
                ->all();
        }

        $requests = collect($paginator->items())
            ->map(function (CourierVendorCodCapability $capability) use ($auditEventsByCapability, $auditEventCountByCapability, $auditIntegrityByCapability) {
                $capabilityId = (int) $capability->id;
                $auditTrail = $auditEventsByCapability->get($capabilityId, collect());

                return [
                    'id' => $capabilityId,
                    'status' => (string) $capability->status,
                    'statusLabel' => $capability->statusLabel(),
                    'category' => CourierVendorCodCapability::normalizeCategory((string) $capability->category),
                    'categoryLabel' => $capability->categoryLabel(),
                    'vendorId' => (int) ($capability->vendor_user_id ?? 0),
                    'vendorName' => (string) ($capability->vendor->name ?? ''),
                    'vendorEmail' => (string) ($capability->vendor->email ?? ''),
                    'requestedAt' => optional($capability->requested_at)->format('Y-m-d H:i:s'),
                    'requestedBy' => (string) ($capability->requester->name ?? ''),
                    'requestedNote' => (string) ($capability->requested_note ?? ''),
                    'reviewedAt' => optional($capability->reviewed_at)->format('Y-m-d H:i:s'),
                    'reviewedBy' => (string) ($capability->reviewer->name ?? ''),
                    'approvedAt' => optional($capability->approved_at)->format('Y-m-d H:i:s'),
                    'expiresAt' => optional($capability->expires_at)->format('Y-m-d H:i:s'),
                    'isExpired' => (bool) ($capability->expires_at && $capability->expires_at->isPast()),
                    'decisionReason' => (string) ($capability->decision_reason ?? ''),
                    'auditEventCount' => (int) ($auditEventCountByCapability[$capabilityId] ?? 0),
                    'auditTrail' => $auditTrail->all(),
                    'auditIntegrity' => $auditIntegrityByCapability[$capabilityId] ?? [
                        'isValid' => true,
                        'issueCount' => 0,
                        'verifiedEvents' => 0,
                    ],
                ];
            })
            ->values();

        $statsQuery = CourierVendorCodCapability::query();
        if ($categoryFilter !== 'all') {
            $statsQuery->where('category', $categoryFilter);
        }

        $stats = [
            'total' => (clone $statsQuery)->count(),
            'pending' => (clone $statsQuery)->where('status', CourierVendorCodCapability::STATUS_PENDING)->count(),
            'approved' => (clone $statsQuery)->where('status', CourierVendorCodCapability::STATUS_APPROVED)->count(),
            'rejected' => (clone $statsQuery)->where('status', CourierVendorCodCapability::STATUS_REJECTED)->count(),
        ];

        return Inertia::render('Web/home/SuperAdmin/CourierCodSettings', [
            'settings' => [
                'is_cod_enabled' => (bool) $settings->is_cod_enabled,
                'settlement_cycle_days' => (int) $settings->settlement_cycle_days,
                'holding_days' => (int) $settings->holding_days,
                'reserve_percentage' => (float) $settings->reserve_percentage,
                'minimum_payout_amount' => (float) $settings->minimum_payout_amount,
                'currency_code' => (string) $settings->currency_code,
                'notes' => (string) ($settings->notes ?? ''),
            ],
            'requests' => $requests,
            'filters' => [
                'status' => $statusFilter,
                'category' => $categoryFilter,
                'search' => $search,
            ],
            'pagination' => [
                'currentPage' => $paginator->currentPage(),
                'lastPage' => $paginator->lastPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
            'stats' => $stats,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'is_cod_enabled' => ['required', 'boolean'],
            'settlement_cycle_days' => ['required', 'integer', 'min:1', 'max:31'],
            'holding_days' => ['required', 'integer', 'min:0', 'max:31'],
            'reserve_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'minimum_payout_amount' => ['required', 'numeric', 'min:0'],
            'currency_code' => ['required', 'string', 'size:3'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $settings = CourierCodSettlementSetting::query()->firstOrCreate(
            ['id' => 1],
            CourierCodSettlementSetting::defaults()
        );

        $settings->fill([
            'is_cod_enabled' => (bool) $validated['is_cod_enabled'],
            'settlement_cycle_days' => (int) $validated['settlement_cycle_days'],
            'holding_days' => (int) $validated['holding_days'],
            'reserve_percentage' => (float) $validated['reserve_percentage'],
            'minimum_payout_amount' => (float) $validated['minimum_payout_amount'],
            'currency_code' => strtoupper((string) $validated['currency_code']),
            'notes' => isset($validated['notes']) ? trim((string) $validated['notes']) : null,
            'updated_by_user_id' => (int) optional($request->user())->id ?: null,
        ]);
        $settings->save();

        return back()->with('success', 'COD settlement settings updated successfully.');
    }

    public function approveCapability(Request $request, CourierVendorCodCapability $capability)
    {
        $validated = $request->validate([
            'note' => ['nullable', 'string', 'max:500'],
            'expiresAt' => ['nullable', 'date', 'after:now'],
        ]);

        $previousStatus = (string) ($capability->status ?: CourierVendorCodCapability::STATUS_NOT_REQUESTED);
        $note = trim((string) ($validated['note'] ?? ''));
        $expiresAt = isset($validated['expiresAt'])
            ? Carbon::parse((string) $validated['expiresAt'])
            : now()->addYear();
        $actorId = (int) optional($request->user())->id ?: null;

        $capability->fill([
            'status' => CourierVendorCodCapability::STATUS_APPROVED,
            'reviewed_at' => now(),
            'reviewed_by_user_id' => $actorId > 0 ? $actorId : null,
            'approved_at' => now(),
            'expires_at' => $expiresAt,
            'decision_reason' => $note !== '' ? $note : null,
        ]);

        $capability->save();

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_approved',
            $previousStatus,
            CourierVendorCodCapability::STATUS_APPROVED,
            $actorId > 0 ? $actorId : null,
            $note !== '' ? $note : null,
            [
                'source' => 'superadmin_cod_settlement',
                'expires_at' => optional($expiresAt)->toDateTimeString(),
            ]
        );

        return back()->with('success', 'COD capability approved successfully.');
    }

    public function rejectCapability(Request $request, CourierVendorCodCapability $capability)
    {
        $validated = $request->validate([
            'note' => ['required', 'string', 'max:500'],
        ]);

        $previousStatus = (string) ($capability->status ?: CourierVendorCodCapability::STATUS_NOT_REQUESTED);
        $note = trim((string) ($validated['note'] ?? ''));
        $actorId = (int) optional($request->user())->id ?: null;

        $capability->fill([
            'status' => CourierVendorCodCapability::STATUS_REJECTED,
            'reviewed_at' => now(),
            'reviewed_by_user_id' => $actorId > 0 ? $actorId : null,
            'approved_at' => null,
            'expires_at' => null,
            'decision_reason' => $note,
        ]);

        $capability->save();

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_rejected',
            $previousStatus,
            CourierVendorCodCapability::STATUS_REJECTED,
            $actorId > 0 ? $actorId : null,
            $note,
            [
                'source' => 'superadmin_cod_settlement',
            ]
        );

        return back()->with('success', 'COD capability request rejected.');
    }

    public function capabilityAuditHistory(Request $request, CourierVendorCodCapability $capability)
    {
        $validated = $request->validate([
            'eventType' => ['nullable', 'string', 'in:all,cod_capability_request_submitted,cod_capability_approved,cod_capability_rejected'],
            'actor' => ['nullable', 'string', 'max:120'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'perPage' => ['nullable', 'integer', 'min:5', 'max:50'],
        ]);

        $eventType = trim((string) ($validated['eventType'] ?? 'all'));
        $actor = trim((string) ($validated['actor'] ?? ''));
        $from = isset($validated['from']) ? Carbon::parse((string) $validated['from'])->startOfDay() : null;
        $to = isset($validated['to']) ? Carbon::parse((string) $validated['to'])->endOfDay() : null;
        $perPage = (int) ($validated['perPage'] ?? 15);

        $query = CourierVendorCodCapabilityAudit::query()
            ->with(['actor:id,name'])
            ->where('courier_vendor_cod_capability_id', (int) $capability->id)
            ->orderByDesc('id');

        if ($eventType !== '' && $eventType !== 'all') {
            $query->where('event_type', $eventType);
        }

        if ($actor !== '') {
            $query->whereHas('actor', function (Builder $builder) use ($actor) {
                $builder->where('name', 'like', '%' . $actor . '%');
            });
        }

        if ($from !== null) {
            $query->where('created_at', '>=', $from);
        }

        if ($to !== null) {
            $query->where('created_at', '<=', $to);
        }

        $paginator = $query->paginate($perPage)->withQueryString();

        $integrityIndex = $this->verifyCapabilityAuditChain((int) $capability->id);

        $events = collect($paginator->items())
            ->map(fn (CourierVendorCodCapabilityAudit $audit) => $this->serializeCapabilityAuditEvent(
                $audit,
                $integrityIndex['events'][(int) $audit->id] ?? null
            ))
            ->values();

        $capability->loadMissing(['vendor:id,name,email']);

        return response()->json([
            'capability' => [
                'id' => (int) $capability->id,
                'vendorName' => (string) ($capability->vendor->name ?? ''),
                'vendorEmail' => (string) ($capability->vendor->email ?? ''),
                'category' => CourierVendorCodCapability::normalizeCategory((string) $capability->category),
                'categoryLabel' => $capability->categoryLabel(),
                'status' => (string) $capability->status,
                'statusLabel' => $capability->statusLabel(),
            ],
            'events' => $events,
            'pagination' => [
                'currentPage' => $paginator->currentPage(),
                'lastPage' => $paginator->lastPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
            'filters' => [
                'eventType' => $eventType !== '' ? $eventType : 'all',
                'actor' => $actor,
                'from' => $from?->toDateString() ?? '',
                'to' => $to?->toDateString() ?? '',
            ],
            'integrity' => $integrityIndex['summary'],
        ]);
    }

    private function serializeCapabilityAuditEvent(CourierVendorCodCapabilityAudit $audit, ?array $integrityContext = null): array
    {
        $fromStatus = (string) ($audit->from_status ?? '');
        $toStatus = (string) ($audit->to_status ?? '');

        $transitionParts = array_values(array_filter([
            $fromStatus !== '' ? $this->statusLabelFromKey($fromStatus) : null,
            $toStatus !== '' ? $this->statusLabelFromKey($toStatus) : null,
        ]));

        return [
            'id' => (int) $audit->id,
            'eventType' => (string) $audit->event_type,
            'eventLabel' => $this->auditEventLabel((string) $audit->event_type),
            'fromStatus' => $fromStatus,
            'toStatus' => $toStatus,
            'transitionLabel' => count($transitionParts) === 2
                ? ($transitionParts[0] . ' -> ' . $transitionParts[1])
                : ($transitionParts[0] ?? ''),
            'actorName' => (string) ($audit->actor->name ?? 'System'),
            'note' => (string) ($audit->note ?? ''),
            'source' => (string) data_get($audit->metadata, 'source', ''),
            'expiresAt' => (string) data_get($audit->metadata, 'expires_at', ''),
            'createdAt' => optional($audit->created_at)->format('Y-m-d H:i:s'),
            'integrityStatus' => (bool) ($integrityContext['isValid'] ?? true) ? 'valid' : 'issue',
            'integrityReason' => (string) ($integrityContext['reason'] ?? ''),
        ];
    }

    private function verifyCapabilityAuditChain(int $capabilityId): array
    {
        if ($capabilityId <= 0) {
            return [
                'events' => [],
                'summary' => [
                    'isValid' => true,
                    'issueCount' => 0,
                    'verifiedEvents' => 0,
                ],
            ];
        }

        /** @var \Illuminate\Database\Eloquent\Collection<int, CourierVendorCodCapabilityAudit> $audits */
        $audits = CourierVendorCodCapabilityAudit::query()
            ->where('courier_vendor_cod_capability_id', $capabilityId)
            ->orderBy('id')
            ->get();

        return $this->buildAuditIntegrityIndex($audits);
    }

    private function buildAuditIntegrityIndex(Collection $audits): array
    {
        if ($audits->isEmpty()) {
            return [
                'events' => [],
                'summary' => [
                    'isValid' => true,
                    'issueCount' => 0,
                    'verifiedEvents' => 0,
                ],
            ];
        }

        $expectedPreviousHash = null;
        $eventIntegrity = [];
        $issueCount = 0;

        foreach ($audits as $audit) {
            /** @var CourierVendorCodCapabilityAudit $audit */
            $storedPreviousHash = $this->normalizeHash((string) ($audit->previous_hash ?? ''));
            $storedRecordHash = $this->normalizeHash((string) ($audit->record_hash ?? ''));

            $linkValid = $storedPreviousHash === $expectedPreviousHash;

            $computedRecordHash = CourierVendorCodCapabilityAudit::computeRecordHash(
                CourierVendorCodCapabilityAudit::buildHashPayloadFromAudit($audit, $storedPreviousHash)
            );

            $hashValid = $storedRecordHash !== null && hash_equals($storedRecordHash, $computedRecordHash);

            $reason = '';
            if (!$linkValid && !$hashValid) {
                $reason = 'previous_hash_and_record_hash_mismatch';
            } elseif (!$linkValid) {
                $reason = 'previous_hash_mismatch';
            } elseif (!$hashValid) {
                $reason = 'record_hash_mismatch';
            }

            $isValid = $reason === '';
            if (!$isValid) {
                $issueCount++;
            }

            $eventIntegrity[(int) $audit->id] = [
                'isValid' => $isValid,
                'reason' => $reason,
            ];

            $expectedPreviousHash = $storedRecordHash;
        }

        return [
            'events' => $eventIntegrity,
            'summary' => [
                'isValid' => $issueCount === 0,
                'issueCount' => $issueCount,
                'verifiedEvents' => $audits->count(),
            ],
        ];
    }

    private function normalizeHash(string $value): ?string
    {
        $normalized = strtolower(trim($value));

        return $normalized !== '' ? $normalized : null;
    }

    private function auditEventLabel(string $eventType): string
    {
        return match ($eventType) {
            'cod_capability_request_submitted' => 'Request submitted',
            'cod_capability_approved' => 'Capability approved',
            'cod_capability_rejected' => 'Capability rejected',
            default => ucwords(str_replace('_', ' ', trim($eventType) !== '' ? $eventType : 'cod_capability_event')),
        };
    }

    private function statusLabelFromKey(string $status): string
    {
        $normalized = strtolower(trim($status));

        return CourierVendorCodCapability::STATUS_LABELS[$normalized]
            ?? ucwords(str_replace('_', ' ', $normalized));
    }
}
