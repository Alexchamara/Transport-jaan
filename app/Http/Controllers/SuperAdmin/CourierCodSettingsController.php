<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Courier\CourierCodSettlementSetting;
use App\Models\Courier\CourierVendorCodCapability;
use App\Models\Courier\CourierVendorCodCapabilityAudit;
use App\Models\Courier\CourierVendorCodIntegrityIncident;
use App\Services\Courier\CourierCodComplianceExportService;
use App\Services\Courier\CourierCodIntegrityAlertService;
use App\Services\Courier\CourierSensitiveActionApprovalService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CourierCodSettingsController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:all,pending,approved,rejected,not_requested'],
            'category' => ['nullable', 'string', 'in:all,domestic,international,logistic'],
            'search' => ['nullable', 'string', 'max:120'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $statusFilter = (string) ($validated['status'] ?? 'all');
        $categoryFilter = $this->normalizeCapabilityCategoryFilter((string) ($validated['category'] ?? 'all'));
        $search = trim((string) ($validated['search'] ?? ''));
        $from = isset($validated['from']) ? Carbon::parse((string) $validated['from'])->startOfDay() : null;
        $to = isset($validated['to']) ? Carbon::parse((string) $validated['to'])->endOfDay() : null;

        $settings = CourierCodSettlementSetting::query()->firstOrCreate(
            ['id' => 1],
            CourierCodSettlementSetting::defaults()
        );
        $codGovernancePolicy = $this->resolveCodGovernancePolicyFromSettings($settings);

        $query = CourierVendorCodCapability::query()
            ->with(['vendor:id,name,email,status', 'requester:id,name', 'reviewer:id,name'])
            ->orderByRaw("case when status = 'pending' then 0 when status = 'rejected' then 1 when status = 'approved' then 2 else 3 end")
            ->orderByDesc('requested_at')
            ->orderByDesc('id');

        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        if ($categoryFilter !== 'all') {
            $this->applyCapabilityCategoryFilter($query, $categoryFilter);
        }

        if ($search !== '') {
            $query->whereHas('vendor', function (Builder $builder) use ($search) {
                $builder
                    ->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        if ($from !== null) {
            $query->where('requested_at', '>=', $from);
        }

        if ($to !== null) {
            $query->where('requested_at', '<=', $to);
        }

        $paginator = $query->paginate(20)->withQueryString();

        $capabilityIds = collect($paginator->items())
            ->map(static fn (CourierVendorCodCapability $capability) => (int) $capability->id)
            ->filter(static fn (int $id) => $id > 0)
            ->values();

        $auditEventsByCapability = collect();
        $auditEventCountByCapability = [];
        $auditIntegrityByCapability = [];
        $activeIncidentByCapability = [];
        $latestIncidentByCapability = [];

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

            $incidents = CourierVendorCodIntegrityIncident::query()
                ->with(['creator:id,name', 'assignee:id,name', 'resolver:id,name'])
                ->whereIn('courier_vendor_cod_capability_id', $capabilityIds->all())
                ->orderByDesc('id')
                ->get()
                ->groupBy(static fn (CourierVendorCodIntegrityIncident $incident) => (int) $incident->courier_vendor_cod_capability_id);

            $latestIncidentByCapability = $incidents
                ->map(fn (Collection $rows) => $rows->first())
                ->all();

            $activeIncidentByCapability = $incidents
                ->map(function (Collection $rows) {
                    return $rows->first(function (CourierVendorCodIntegrityIncident $incident) {
                        return in_array(
                            CourierVendorCodIntegrityIncident::normalizeStatus((string) $incident->status),
                            CourierVendorCodIntegrityIncident::STATUSES_ACTIVE,
                            true
                        );
                    });
                })
                ->all();
        }

        $requests = collect($paginator->items())
            ->map(function (CourierVendorCodCapability $capability) use ($auditEventsByCapability, $auditEventCountByCapability, $auditIntegrityByCapability, $activeIncidentByCapability, $latestIncidentByCapability, $codGovernancePolicy) {
                $capabilityId = (int) $capability->id;
                $auditTrail = $auditEventsByCapability->get($capabilityId, collect());
                $auditIntegrity = $auditIntegrityByCapability[$capabilityId] ?? [
                    'isValid' => true,
                    'issueCount' => 0,
                    'verifiedEvents' => 0,
                ];
                $activeIncident = $activeIncidentByCapability[$capabilityId] ?? null;
                $latestIncident = $latestIncidentByCapability[$capabilityId] ?? null;
                $normalizedCategory = CourierVendorCodCapability::normalizeCategory((string) $capability->category);
                $categoryPolicy = is_array($codGovernancePolicy['category_policies'][$normalizedCategory] ?? null)
                    ? $codGovernancePolicy['category_policies'][$normalizedCategory]
                    : [
                        'cod_enabled' => true,
                        'allow_lock_override' => true,
                    ];

                return [
                    'id' => $capabilityId,
                    'status' => (string) $capability->status,
                    'statusLabel' => $capability->statusLabel(),
                    'category' => $normalizedCategory,
                    'categoryLabel' => $this->capabilityCategoryLabel($normalizedCategory),
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
                    'auditIntegrity' => $auditIntegrity,
                    'activeIncident' => $this->serializeIntegrityIncident($activeIncident),
                    'latestIncident' => $this->serializeIntegrityIncident($latestIncident),
                    'isActionLocked' => $activeIncident instanceof CourierVendorCodIntegrityIncident,
                    'canOpenIncident' => !(bool) ($auditIntegrity['isValid'] ?? true)
                        && !($activeIncident instanceof CourierVendorCodIntegrityIncident),
                    'categoryPolicy' => [
                        'codEnabled' => (bool) ($categoryPolicy['cod_enabled'] ?? true),
                        'allowLockOverride' => (bool) ($categoryPolicy['allow_lock_override'] ?? true),
                    ],
                ];
            })
            ->values();

        $statsQuery = CourierVendorCodCapability::query();
        if ($categoryFilter !== 'all') {
            $this->applyCapabilityCategoryFilter($statsQuery, $categoryFilter);
        }

        if ($from !== null) {
            $statsQuery->where('requested_at', '>=', $from);
        }

        if ($to !== null) {
            $statsQuery->where('requested_at', '<=', $to);
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
                'category_policies' => $codGovernancePolicy['category_policies'],
                'override_policy' => $codGovernancePolicy['override_policy'],
            ],
            'requests' => $requests,
            'filters' => [
                'status' => $statusFilter,
                'category' => $categoryFilter,
                'search' => $search,
                'from' => $from?->toDateString() ?? '',
                'to' => $to?->toDateString() ?? '',
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
            'category_policies' => ['nullable', 'array'],
            'category_policies.domestic' => ['nullable', 'array'],
            'category_policies.domestic.cod_enabled' => ['nullable', 'boolean'],
            'category_policies.domestic.allow_lock_override' => ['nullable', 'boolean'],
            'category_policies.international' => ['nullable', 'array'],
            'category_policies.international.cod_enabled' => ['nullable', 'boolean'],
            'category_policies.international.allow_lock_override' => ['nullable', 'boolean'],
            'override_policy' => ['nullable', 'array'],
            'override_policy.enabled' => ['nullable', 'boolean'],
            'override_policy.maker_checker' => ['nullable', 'boolean'],
            'override_policy.level1_min_amount' => ['nullable', 'numeric', 'min:0'],
            'override_policy.level2_min_amount' => ['nullable', 'numeric', 'min:0'],
            'override_policy.required_approvals_level1' => ['nullable', 'integer', 'min:1', 'max:3'],
            'override_policy.required_approvals_level2' => ['nullable', 'integer', 'min:1', 'max:3'],
        ]);

        $settings = CourierCodSettlementSetting::query()->firstOrCreate(
            ['id' => 1],
            CourierCodSettlementSetting::defaults()
        );

        $existingGovernancePolicy = $this->resolveCodGovernancePolicyFromSettings($settings);
        $categoryPoliciesInput = is_array($validated['category_policies'] ?? null)
            ? $validated['category_policies']
            : [];
        $overridePolicyInput = is_array($validated['override_policy'] ?? null)
            ? $validated['override_policy']
            : [];

        $mergedGovernancePolicy = $this->normalizeCodGovernancePolicy([
            'category_policies' => [
                'domestic' => array_merge(
                    is_array($existingGovernancePolicy['category_policies']['domestic'] ?? null)
                        ? $existingGovernancePolicy['category_policies']['domestic']
                        : [],
                    is_array($categoryPoliciesInput['domestic'] ?? null)
                        ? $categoryPoliciesInput['domestic']
                        : []
                ),
                'international' => array_merge(
                    is_array($existingGovernancePolicy['category_policies']['international'] ?? null)
                        ? $existingGovernancePolicy['category_policies']['international']
                        : [],
                    is_array($categoryPoliciesInput['international'] ?? null)
                        ? $categoryPoliciesInput['international']
                        : []
                ),
            ],
            'override_policy' => array_merge(
                is_array($existingGovernancePolicy['override_policy'] ?? null)
                    ? $existingGovernancePolicy['override_policy']
                    : [],
                $overridePolicyInput
            ),
        ]);

        $metadata = is_array($settings->metadata) ? $settings->metadata : [];
        $metadata['governance'] = $mergedGovernancePolicy;

        $settings->fill([
            'is_cod_enabled' => (bool) $validated['is_cod_enabled'],
            'settlement_cycle_days' => (int) $validated['settlement_cycle_days'],
            'holding_days' => (int) $validated['holding_days'],
            'reserve_percentage' => (float) $validated['reserve_percentage'],
            'minimum_payout_amount' => (float) $validated['minimum_payout_amount'],
            'currency_code' => strtoupper((string) $validated['currency_code']),
            'notes' => isset($validated['notes']) ? trim((string) $validated['notes']) : null,
            'updated_by_user_id' => (int) optional($request->user())->id ?: null,
            'metadata' => $metadata,
        ]);
        $settings->save();

        return back()->with('success', 'COD settlement settings updated successfully.');
    }

    public function approveCapability(Request $request, CourierVendorCodCapability $capability)
    {
        $validated = $request->validate([
            'note' => ['nullable', 'string', 'max:500'],
            'expiresAt' => ['nullable', 'date', 'after:now'],
            'overrideLock' => ['nullable', 'boolean'],
            'overrideExposureAmount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $previousStatus = (string) ($capability->status ?: CourierVendorCodCapability::STATUS_NOT_REQUESTED);
        $note = trim((string) ($validated['note'] ?? ''));
        $overrideLock = (bool) ($validated['overrideLock'] ?? false);
        $overrideExposureAmount = array_key_exists('overrideExposureAmount', $validated)
            ? (float) $validated['overrideExposureAmount']
            : null;
        $overrideContext = $this->assertCapabilityDecisionAllowed(
            $request,
            $capability,
            $note,
            $overrideLock,
            $overrideExposureAmount,
            'approve'
        );
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

        $auditMetadata = [
            'source' => 'superadmin_cod_settlement',
            'expires_at' => optional($expiresAt)->toDateTimeString(),
        ];
        if ((bool) ($overrideContext['overrideUsed'] ?? false)) {
            $auditMetadata['override'] = $overrideContext;
        }

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_approved',
            $previousStatus,
            CourierVendorCodCapability::STATUS_APPROVED,
            $actorId > 0 ? $actorId : null,
            $note !== '' ? $note : null,
            $auditMetadata
        );

        return back()->with('success', 'COD capability approved successfully.');
    }

    public function rejectCapability(Request $request, CourierVendorCodCapability $capability)
    {
        $validated = $request->validate([
            'note' => ['required', 'string', 'max:500'],
            'overrideLock' => ['nullable', 'boolean'],
            'overrideExposureAmount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $previousStatus = (string) ($capability->status ?: CourierVendorCodCapability::STATUS_NOT_REQUESTED);
        $note = trim((string) ($validated['note'] ?? ''));
        $overrideLock = (bool) ($validated['overrideLock'] ?? false);
        $overrideExposureAmount = array_key_exists('overrideExposureAmount', $validated)
            ? (float) $validated['overrideExposureAmount']
            : null;
        $overrideContext = $this->assertCapabilityDecisionAllowed(
            $request,
            $capability,
            $note,
            $overrideLock,
            $overrideExposureAmount,
            'reject'
        );
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

        $auditMetadata = [
            'source' => 'superadmin_cod_settlement',
        ];
        if ((bool) ($overrideContext['overrideUsed'] ?? false)) {
            $auditMetadata['override'] = $overrideContext;
        }

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_rejected',
            $previousStatus,
            CourierVendorCodCapability::STATUS_REJECTED,
            $actorId > 0 ? $actorId : null,
            $note,
            $auditMetadata
        );

        return back()->with('success', 'COD capability request rejected.');
    }

    public function revokeCapability(Request $request, CourierVendorCodCapability $capability)
    {
        $validated = $request->validate([
            'note' => ['required', 'string', 'min:10', 'max:500'],
            'overrideLock' => ['nullable', 'boolean'],
            'overrideExposureAmount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $previousStatus = (string) ($capability->status ?: CourierVendorCodCapability::STATUS_NOT_REQUESTED);
        $note = trim((string) ($validated['note'] ?? ''));
        $overrideLock = (bool) ($validated['overrideLock'] ?? false);
        $overrideExposureAmount = array_key_exists('overrideExposureAmount', $validated)
            ? (float) $validated['overrideExposureAmount']
            : null;
        $overrideContext = $this->assertCapabilityDecisionAllowed(
            $request,
            $capability,
            $note,
            $overrideLock,
            $overrideExposureAmount,
            'revoke'
        );
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

        $auditMetadata = [
            'source' => 'superadmin_cod_settlement',
            'revoked_from_status' => $previousStatus,
        ];
        if ((bool) ($overrideContext['overrideUsed'] ?? false)) {
            $auditMetadata['override'] = $overrideContext;
        }

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_revoked',
            $previousStatus,
            CourierVendorCodCapability::STATUS_REJECTED,
            $actorId > 0 ? $actorId : null,
            $note,
            $auditMetadata
        );

        return back()->with('success', 'COD capability has been revoked.');
    }

    public function capabilityAuditHistory(Request $request, CourierVendorCodCapability $capability)
    {
        $validated = $request->validate([
            'eventType' => ['nullable', 'string', 'in:all,cod_capability_request_submitted,cod_capability_approved,cod_capability_rejected,cod_capability_revoked,cod_integrity_incident_opened,cod_integrity_incident_assigned,cod_integrity_incident_resolved,cod_integrity_incident_dismissed'],
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
        $activeIncident = CourierVendorCodIntegrityIncident::query()
            ->with(['creator:id,name', 'assignee:id,name', 'resolver:id,name'])
            ->active()
            ->where('courier_vendor_cod_capability_id', (int) $capability->id)
            ->latest('id')
            ->first();

        $events = collect($paginator->items())
            ->map(fn (CourierVendorCodCapabilityAudit $audit) => $this->serializeCapabilityAuditEvent(
                $audit,
                $integrityIndex['events'][(int) $audit->id] ?? null
            ))
            ->values();

        $capability->loadMissing(['vendor:id,name,email']);

        $normalizedCategory = CourierVendorCodCapability::normalizeCategory((string) $capability->category);

        return response()->json([
            'capability' => [
                'id' => (int) $capability->id,
                'vendorName' => (string) ($capability->vendor->name ?? ''),
                'vendorEmail' => (string) ($capability->vendor->email ?? ''),
                'category' => $normalizedCategory,
                'categoryLabel' => $this->capabilityCategoryLabel($normalizedCategory),
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
            'activeIncident' => $this->serializeIntegrityIncident($activeIncident),
        ]);
    }

    public function exportCompliancePackage(Request $request, CourierCodComplianceExportService $exportService)
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:all,pending,approved,rejected,not_requested'],
            'category' => ['nullable', 'string', 'in:all,domestic,international,logistic'],
            'search' => ['nullable', 'string', 'max:120'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $categoryFilter = $this->normalizeCapabilityCategoryFilter((string) ($validated['category'] ?? 'all'));

        $package = $exportService->buildPackage([
            'status' => (string) ($validated['status'] ?? 'all'),
            'category' => $categoryFilter,
            'search' => trim((string) ($validated['search'] ?? '')),
            'from' => $validated['from'] ?? null,
            'to' => $validated['to'] ?? null,
        ], (int) optional($request->user())->id ?: null);

        $fileName = $exportService->buildFileName();
        $jsonPayload = $exportService->encodePackage($package);

        return response()->streamDownload(function () use ($jsonPayload) {
            echo $jsonPayload;
        }, $fileName, [
            'Content-Type' => 'application/json',
        ]);
    }

    public function openIntegrityIncident(Request $request, CourierVendorCodCapability $capability)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:2000'],
            'severity' => ['nullable', 'string', 'in:low,medium,high,critical'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $integrityIndex = $this->verifyCapabilityAuditChain((int) $capability->id);
        $integritySummary = $integrityIndex['summary'];

        if ((bool) ($integritySummary['isValid'] ?? true)) {
            throw ValidationException::withMessages([
                'incident' => ['Audit integrity is currently valid. No incident can be opened.'],
            ]);
        }

        $existingActive = CourierVendorCodIntegrityIncident::query()
            ->active()
            ->where('courier_vendor_cod_capability_id', (int) $capability->id)
            ->latest('id')
            ->first();

        if ($existingActive instanceof CourierVendorCodIntegrityIncident) {
            throw ValidationException::withMessages([
                'incident' => ['An unresolved integrity incident already exists for this capability.'],
            ]);
        }

        $actorId = (int) optional($request->user())->id ?: null;
        $severity = CourierVendorCodIntegrityIncident::normalizeSeverity((string) ($validated['severity'] ?? 'high'));
        $title = trim((string) $validated['title']);
        $description = trim((string) ($validated['description'] ?? ''));
        $note = trim((string) ($validated['note'] ?? ''));

        $issueEvents = collect($integrityIndex['events'])
            ->filter(static fn ($event) => !((bool) data_get($event, 'isValid', false)))
            ->map(function ($event, $auditId) {
                return [
                    'auditId' => (int) $auditId,
                    'reason' => (string) data_get($event, 'reason', ''),
                ];
            })
            ->values()
            ->all();

        $incident = CourierVendorCodIntegrityIncident::query()->create([
            'courier_vendor_cod_capability_id' => (int) $capability->id,
            'vendor_user_id' => (int) $capability->vendor_user_id,
            'category' => CourierVendorCodCapability::normalizeCategory((string) $capability->category),
            'status' => CourierVendorCodIntegrityIncident::STATUS_OPEN,
            'severity' => $severity,
            'title' => $title,
            'description' => $description !== '' ? $description : null,
            'detected_issue_count' => (int) ($integritySummary['issueCount'] ?? 0),
            'integrity_snapshot' => [
                'summary' => $integritySummary,
                'issues' => $issueEvents,
            ],
            'detected_at' => now(),
            'created_by_user_id' => $actorId > 0 ? $actorId : null,
            'metadata' => [
                'source' => 'superadmin_cod_settlement',
            ],
        ]);

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_integrity_incident_opened',
            (string) $capability->status,
            (string) $capability->status,
            $actorId > 0 ? $actorId : null,
            $note !== '' ? $note : null,
            [
                'source' => 'superadmin_cod_settlement',
                'incident_id' => (int) $incident->id,
                'incident_status' => CourierVendorCodIntegrityIncident::STATUS_OPEN,
                'incident_severity' => $severity,
                'incident_issue_count' => (int) ($integritySummary['issueCount'] ?? 0),
            ]
        );

        $this->codIntegrityAlerts()->incidentOpened($incident, [
            'source' => 'superadmin_cod_settlement',
            'trigger' => 'manual_open',
            'actor_user_id' => $actorId > 0 ? $actorId : null,
        ]);

        return back()->with('success', 'COD integrity incident opened. Capability actions are now locked until resolution.');
    }

    public function assignIntegrityIncident(Request $request, CourierVendorCodIntegrityIncident $incident)
    {
        $validated = $request->validate([
            'assignedToUserId' => ['nullable', 'integer', 'exists:users,id'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        if (!in_array(
            CourierVendorCodIntegrityIncident::normalizeStatus((string) $incident->status),
            CourierVendorCodIntegrityIncident::STATUSES_ACTIVE,
            true
        )) {
            throw ValidationException::withMessages([
                'incident' => ['Only open or investigating incidents can be assigned.'],
            ]);
        }

        $actorId = (int) optional($request->user())->id ?: null;
        $assigneeId = (int) ($validated['assignedToUserId'] ?? 0);

        if ($assigneeId <= 0 && $actorId > 0) {
            $assigneeId = $actorId;
        }

        if ($assigneeId <= 0) {
            throw ValidationException::withMessages([
                'assignedToUserId' => ['Provide a valid assignee.'],
            ]);
        }

        $incident->fill([
            'assigned_to_user_id' => $assigneeId,
            'assigned_at' => now(),
            'status' => CourierVendorCodIntegrityIncident::STATUS_INVESTIGATING,
        ]);
        $incident->save();

        $note = trim((string) ($validated['note'] ?? ''));
        $capability = $incident->capability()->firstOrFail();

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_integrity_incident_assigned',
            (string) $capability->status,
            (string) $capability->status,
            $actorId > 0 ? $actorId : null,
            $note !== '' ? $note : null,
            [
                'source' => 'superadmin_cod_settlement',
                'incident_id' => (int) $incident->id,
                'incident_status' => CourierVendorCodIntegrityIncident::STATUS_INVESTIGATING,
                'assigned_to_user_id' => $assigneeId,
            ]
        );

        $this->codIntegrityAlerts()->incidentAssigned($incident, [
            'source' => 'superadmin_cod_settlement',
            'trigger' => 'manual_assign',
            'actor_user_id' => $actorId > 0 ? $actorId : null,
        ]);

        return back()->with('success', 'Integrity incident assigned and moved to investigating status.');
    }

    public function resolveIntegrityIncident(Request $request, CourierVendorCodIntegrityIncident $incident)
    {
        $validated = $request->validate([
            'resolutionStatus' => ['nullable', 'string', 'in:resolved,dismissed'],
            'resolutionNote' => ['required', 'string', 'max:2000'],
        ]);

        if (!in_array(
            CourierVendorCodIntegrityIncident::normalizeStatus((string) $incident->status),
            CourierVendorCodIntegrityIncident::STATUSES_ACTIVE,
            true
        )) {
            throw ValidationException::withMessages([
                'incident' => ['Only open or investigating incidents can be resolved.'],
            ]);
        }

        $resolutionStatus = CourierVendorCodIntegrityIncident::normalizeStatus((string) ($validated['resolutionStatus'] ?? CourierVendorCodIntegrityIncident::STATUS_RESOLVED));
        if (!in_array($resolutionStatus, [CourierVendorCodIntegrityIncident::STATUS_RESOLVED, CourierVendorCodIntegrityIncident::STATUS_DISMISSED], true)) {
            $resolutionStatus = CourierVendorCodIntegrityIncident::STATUS_RESOLVED;
        }

        $actorId = (int) optional($request->user())->id ?: null;
        $resolutionNote = trim((string) $validated['resolutionNote']);

        $incident->fill([
            'status' => $resolutionStatus,
            'resolved_by_user_id' => $actorId > 0 ? $actorId : null,
            'resolved_at' => now(),
            'resolution_note' => $resolutionNote,
        ]);
        $incident->save();

        $capability = $incident->capability()->firstOrFail();

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            $resolutionStatus === CourierVendorCodIntegrityIncident::STATUS_DISMISSED
                ? 'cod_integrity_incident_dismissed'
                : 'cod_integrity_incident_resolved',
            (string) $capability->status,
            (string) $capability->status,
            $actorId > 0 ? $actorId : null,
            $resolutionNote,
            [
                'source' => 'superadmin_cod_settlement',
                'incident_id' => (int) $incident->id,
                'incident_status' => $resolutionStatus,
            ]
        );

        $this->codIntegrityAlerts()->incidentResolved($incident, [
            'source' => 'superadmin_cod_settlement',
            'trigger' => $resolutionStatus === CourierVendorCodIntegrityIncident::STATUS_DISMISSED
                ? 'manual_dismiss'
                : 'manual_resolve',
            'actor_user_id' => $actorId > 0 ? $actorId : null,
        ]);

        return back()->with('success', 'Integrity incident updated successfully.');
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

    private function serializeIntegrityIncident(?CourierVendorCodIntegrityIncident $incident): ?array
    {
        if (!$incident instanceof CourierVendorCodIntegrityIncident) {
            return null;
        }

        return [
            'id' => (int) $incident->id,
            'status' => CourierVendorCodIntegrityIncident::normalizeStatus((string) $incident->status),
            'statusLabel' => $incident->statusLabel(),
            'severity' => CourierVendorCodIntegrityIncident::normalizeSeverity((string) $incident->severity),
            'severityLabel' => $incident->severityLabel(),
            'title' => (string) ($incident->title ?? ''),
            'description' => (string) ($incident->description ?? ''),
            'detectedIssueCount' => (int) ($incident->detected_issue_count ?? 0),
            'detectedAt' => optional($incident->detected_at)->format('Y-m-d H:i:s'),
            'createdBy' => (string) ($incident->creator->name ?? ''),
            'assignedTo' => (string) ($incident->assignee->name ?? ''),
            'assignedAt' => optional($incident->assigned_at)->format('Y-m-d H:i:s'),
            'resolvedBy' => (string) ($incident->resolver->name ?? ''),
            'resolvedAt' => optional($incident->resolved_at)->format('Y-m-d H:i:s'),
            'resolutionNote' => (string) ($incident->resolution_note ?? ''),
        ];
    }

    private function assertCapabilityDecisionAllowed(
        Request $request,
        CourierVendorCodCapability $capability,
        string $note = '',
        bool $overrideLock = false,
        ?float $overrideExposureAmount = null,
        string $decisionAction = 'approve'
    ): array
    {
        $capabilityId = (int) $capability->id;
        $normalizedCategory = CourierVendorCodCapability::normalizeCategory((string) $capability->category);

        $activeIncident = CourierVendorCodIntegrityIncident::query()
            ->active()
            ->where('courier_vendor_cod_capability_id', $capabilityId)
            ->latest('id')
            ->first();

        $integritySummary = $this->verifyCapabilityAuditChain($capabilityId)['summary'];
        $integrityIsValid = (bool) ($integritySummary['isValid'] ?? true);

        $governancePolicy = $this->resolveCodGovernancePolicy();
        $categoryPolicy = is_array($governancePolicy['category_policies'][$normalizedCategory] ?? null)
            ? $governancePolicy['category_policies'][$normalizedCategory]
            : [
                'cod_enabled' => true,
                'allow_lock_override' => true,
            ];

        $categoryDisabledForApproval = $decisionAction === 'approve'
            && !((bool) ($categoryPolicy['cod_enabled'] ?? true));

        $latestIncident = CourierVendorCodIntegrityIncident::query()
            ->where('courier_vendor_cod_capability_id', $capabilityId)
            ->latest('id')
            ->first();

        $integrityRequiresLock = !$integrityIsValid;
        if ($integrityRequiresLock && $latestIncident instanceof CourierVendorCodIntegrityIncident) {
            $latestStatus = CourierVendorCodIntegrityIncident::normalizeStatus((string) $latestIncident->status);
            if (in_array($latestStatus, [CourierVendorCodIntegrityIncident::STATUS_RESOLVED, CourierVendorCodIntegrityIncident::STATUS_DISMISSED], true)) {
                $integrityRequiresLock = false;
            }
        }

        $requiresLockOverride = $activeIncident instanceof CourierVendorCodIntegrityIncident
            || $integrityRequiresLock
            || $categoryDisabledForApproval;

        if (!$requiresLockOverride) {
            return [
                'overrideUsed' => false,
                'category' => $normalizedCategory,
            ];
        }

        if (!$overrideLock) {
            $reasons = [];
            if ($categoryDisabledForApproval) {
                $reasons[] = 'COD capability approvals are disabled by category policy for this scope.';
            }
            if ($activeIncident instanceof CourierVendorCodIntegrityIncident) {
                $reasons[] = 'An unresolved integrity incident is active. Resolve or dismiss it before changing COD capability status.';
            }
            if ($integrityRequiresLock) {
                $reasons[] = 'Audit chain integrity has issues. Open and resolve an integrity incident before changing COD capability status.';
            }

            throw ValidationException::withMessages([
                'capability' => $reasons,
            ]);
        }

        if (!(bool) ($categoryPolicy['allow_lock_override'] ?? true)) {
            throw ValidationException::withMessages([
                'overrideLock' => ['Category policy does not allow override while capability lock conditions are active.'],
            ]);
        }

        $resolvedOverrideAmount = max(0, (float) ($overrideExposureAmount ?? 0));
        if ($resolvedOverrideAmount <= 0) {
            throw ValidationException::withMessages([
                'overrideExposureAmount' => ['Provide a positive override exposure amount when bypassing lock conditions.'],
            ]);
        }

        $overrideRequirement = app(CourierSensitiveActionApprovalService::class)->resolveRequirement(
            $this->buildCodOverrideApprovalPolicy($governancePolicy['override_policy'] ?? []),
            CourierSensitiveActionApprovalService::ACTION_COD_OVERRIDE,
            [
                'amount' => $resolvedOverrideAmount,
            ]
        );

        $thresholdLevel = (string) ($overrideRequirement['thresholdLevel'] ?? '');
        $requiredApprovals = (int) ($overrideRequirement['requiredApprovals'] ?? 0);
        $minimumNoteLength = 20;
        if ($thresholdLevel === 'level_2') {
            $minimumNoteLength = 40;
        }

        if (mb_strlen(trim($note)) < $minimumNoteLength) {
            throw ValidationException::withMessages([
                'note' => ['Override reason must be at least ' . $minimumNoteLength . ' characters for this threshold level.'],
            ]);
        }

        return [
            'overrideUsed' => true,
            'category' => $normalizedCategory,
            'thresholdLevel' => $thresholdLevel !== '' ? $thresholdLevel : 'below_threshold',
            'requiredApprovals' => $requiredApprovals,
            'overrideExposureAmount' => round($resolvedOverrideAmount, 2),
            'integrityIssueCount' => (int) ($integritySummary['issueCount'] ?? 0),
            'activeIncidentId' => $activeIncident instanceof CourierVendorCodIntegrityIncident
                ? (int) $activeIncident->id
                : null,
            'decisionAction' => $decisionAction,
        ];

    }

    private function normalizeCapabilityCategoryFilter(string $category): string
    {
        $normalized = strtolower(trim($category));
        if ($normalized === 'logistic') {
            $normalized = CourierVendorCodCapability::CATEGORY_INTERNATIONAL;
        }

        if (!in_array($normalized, ['all', CourierVendorCodCapability::CATEGORY_DOMESTIC, CourierVendorCodCapability::CATEGORY_INTERNATIONAL], true)) {
            return 'all';
        }

        return $normalized;
    }

    private function applyCapabilityCategoryFilter($query, string $categoryFilter): void
    {
        if ($categoryFilter === CourierVendorCodCapability::CATEGORY_DOMESTIC) {
            $query->where('category', CourierVendorCodCapability::CATEGORY_DOMESTIC);
            return;
        }

        if ($categoryFilter === CourierVendorCodCapability::CATEGORY_INTERNATIONAL) {
            $query->whereIn('category', [
                CourierVendorCodCapability::CATEGORY_INTERNATIONAL,
                'logistic',
            ]);
        }
    }

    private function capabilityCategoryLabel(string $category): string
    {
        $normalized = CourierVendorCodCapability::normalizeCategory($category);

        return CourierVendorCodCapability::CATEGORY_LABELS[$normalized] ?? 'Domestic';
    }

    private function resolveCodGovernancePolicyFromSettings(CourierCodSettlementSetting $settings): array
    {
        $metadata = is_array($settings->metadata) ? $settings->metadata : [];
        $governance = is_array($metadata['governance'] ?? null)
            ? $metadata['governance']
            : [];

        return $this->normalizeCodGovernancePolicy($governance);
    }

    private function resolveCodGovernancePolicy(): array
    {
        $settings = CourierCodSettlementSetting::query()->firstOrCreate(
            ['id' => 1],
            CourierCodSettlementSetting::defaults()
        );

        return $this->resolveCodGovernancePolicyFromSettings($settings);
    }

    private function defaultCodGovernancePolicy(): array
    {
        $sensitiveDefaults = app(CourierSensitiveActionApprovalService::class)->defaultPolicy();
        $codOverrideDefaults = is_array($sensitiveDefaults['sensitiveActions'][CourierSensitiveActionApprovalService::ACTION_COD_OVERRIDE] ?? null)
            ? $sensitiveDefaults['sensitiveActions'][CourierSensitiveActionApprovalService::ACTION_COD_OVERRIDE]
            : [];

        return [
            'category_policies' => [
                CourierVendorCodCapability::CATEGORY_DOMESTIC => [
                    'cod_enabled' => true,
                    'allow_lock_override' => true,
                ],
                CourierVendorCodCapability::CATEGORY_INTERNATIONAL => [
                    'cod_enabled' => false,
                    'allow_lock_override' => false,
                ],
            ],
            'override_policy' => [
                'enabled' => (bool) ($sensitiveDefaults['enabled'] ?? true),
                'maker_checker' => (bool) ($sensitiveDefaults['makerChecker'] ?? true),
                'level1_min_amount' => max(0, (float) ($codOverrideDefaults['level1MinAmount'] ?? 25000)),
                'level2_min_amount' => max(0, (float) ($codOverrideDefaults['level2MinAmount'] ?? 100000)),
                'required_approvals_level1' => max(1, min(3, (int) ($codOverrideDefaults['requiredApprovalsLevel1'] ?? 1))),
                'required_approvals_level2' => max(1, min(3, (int) ($codOverrideDefaults['requiredApprovalsLevel2'] ?? 2))),
            ],
        ];
    }

    private function normalizeCodGovernancePolicy(array $policy): array
    {
        $defaults = $this->defaultCodGovernancePolicy();

        $categoryPolicies = is_array($policy['category_policies'] ?? null)
            ? $policy['category_policies']
            : [];
        $overridePolicy = is_array($policy['override_policy'] ?? null)
            ? $policy['override_policy']
            : [];

        $domesticPolicy = array_merge(
            $defaults['category_policies'][CourierVendorCodCapability::CATEGORY_DOMESTIC],
            is_array($categoryPolicies[CourierVendorCodCapability::CATEGORY_DOMESTIC] ?? null)
                ? $categoryPolicies[CourierVendorCodCapability::CATEGORY_DOMESTIC]
                : []
        );
        $internationalPolicy = array_merge(
            $defaults['category_policies'][CourierVendorCodCapability::CATEGORY_INTERNATIONAL],
            is_array($categoryPolicies[CourierVendorCodCapability::CATEGORY_INTERNATIONAL] ?? null)
                ? $categoryPolicies[CourierVendorCodCapability::CATEGORY_INTERNATIONAL]
                : []
        );

        $normalizedOverridePolicy = array_merge($defaults['override_policy'], $overridePolicy);

        $level1 = max(0, (float) ($normalizedOverridePolicy['level1_min_amount'] ?? $defaults['override_policy']['level1_min_amount']));
        $level2 = max($level1, (float) ($normalizedOverridePolicy['level2_min_amount'] ?? $defaults['override_policy']['level2_min_amount']));

        return [
            'category_policies' => [
                CourierVendorCodCapability::CATEGORY_DOMESTIC => [
                    'cod_enabled' => (bool) ($domesticPolicy['cod_enabled'] ?? true),
                    'allow_lock_override' => (bool) ($domesticPolicy['allow_lock_override'] ?? true),
                ],
                CourierVendorCodCapability::CATEGORY_INTERNATIONAL => [
                    'cod_enabled' => (bool) ($internationalPolicy['cod_enabled'] ?? false),
                    'allow_lock_override' => (bool) ($internationalPolicy['allow_lock_override'] ?? false),
                ],
            ],
            'override_policy' => [
                'enabled' => (bool) ($normalizedOverridePolicy['enabled'] ?? true),
                'maker_checker' => (bool) ($normalizedOverridePolicy['maker_checker'] ?? true),
                'level1_min_amount' => $level1,
                'level2_min_amount' => $level2,
                'required_approvals_level1' => max(1, min(3, (int) ($normalizedOverridePolicy['required_approvals_level1'] ?? 1))),
                'required_approvals_level2' => max(1, min(3, (int) ($normalizedOverridePolicy['required_approvals_level2'] ?? 2))),
            ],
        ];
    }

    private function buildCodOverrideApprovalPolicy(array $overridePolicy): array
    {
        $normalizedOverridePolicy = $this->normalizeCodGovernancePolicy([
            'override_policy' => $overridePolicy,
        ])['override_policy'];

        return app(CourierSensitiveActionApprovalService::class)->normalizePolicy([
            'enabled' => (bool) ($normalizedOverridePolicy['enabled'] ?? true),
            'makerChecker' => (bool) ($normalizedOverridePolicy['maker_checker'] ?? true),
            'approvalTtlMinutes' => 240,
            'sensitiveActions' => [
                CourierSensitiveActionApprovalService::ACTION_COD_OVERRIDE => [
                    'enabled' => true,
                    'level1MinAmount' => (float) ($normalizedOverridePolicy['level1_min_amount'] ?? 0),
                    'level2MinAmount' => (float) ($normalizedOverridePolicy['level2_min_amount'] ?? 0),
                    'requiredApprovalsLevel1' => (int) ($normalizedOverridePolicy['required_approvals_level1'] ?? 1),
                    'requiredApprovalsLevel2' => (int) ($normalizedOverridePolicy['required_approvals_level2'] ?? 2),
                ],
            ],
        ]);
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
            'cod_capability_revoked' => 'Capability revoked',
            'cod_integrity_incident_opened' => 'Integrity incident opened',
            'cod_integrity_incident_assigned' => 'Integrity incident assigned',
            'cod_integrity_incident_resolved' => 'Integrity incident resolved',
            'cod_integrity_incident_dismissed' => 'Integrity incident dismissed',
            default => ucwords(str_replace('_', ' ', trim($eventType) !== '' ? $eventType : 'cod_capability_event')),
        };
    }

    private function statusLabelFromKey(string $status): string
    {
        $normalized = strtolower(trim($status));

        return CourierVendorCodCapability::STATUS_LABELS[$normalized]
            ?? ucwords(str_replace('_', ' ', $normalized));
    }

    private function codIntegrityAlerts(): CourierCodIntegrityAlertService
    {
        return app(CourierCodIntegrityAlertService::class);
    }
}
