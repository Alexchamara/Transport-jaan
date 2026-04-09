<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Courier\CourierCodSettlementSetting;
use App\Models\Courier\CourierVendorCodCapability;
use App\Models\Courier\CourierVendorCodCapabilityAudit;
use App\Models\Courier\CourierVendorCodIntegrityIncident;
use App\Services\Courier\CourierCodComplianceExportService;
use App\Services\Courier\CourierCodIntegrityAlertService;
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
        $categoryFilter = (string) ($validated['category'] ?? 'all') === 'domestic'
            ? 'domestic'
            : 'all';
        $search = trim((string) ($validated['search'] ?? ''));
        $from = isset($validated['from']) ? Carbon::parse((string) $validated['from'])->startOfDay() : null;
        $to = isset($validated['to']) ? Carbon::parse((string) $validated['to'])->endOfDay() : null;

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
            $query->whereIn('category', [
                CourierVendorCodCapability::CATEGORY_DOMESTIC,
                CourierVendorCodCapability::CATEGORY_INTERNATIONAL,
                'logistic',
            ]);
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
            ->map(function (CourierVendorCodCapability $capability) use ($auditEventsByCapability, $auditEventCountByCapability, $auditIntegrityByCapability, $activeIncidentByCapability, $latestIncidentByCapability) {
                $capabilityId = (int) $capability->id;
                $auditTrail = $auditEventsByCapability->get($capabilityId, collect());
                $auditIntegrity = $auditIntegrityByCapability[$capabilityId] ?? [
                    'isValid' => true,
                    'issueCount' => 0,
                    'verifiedEvents' => 0,
                ];
                $activeIncident = $activeIncidentByCapability[$capabilityId] ?? null;
                $latestIncident = $latestIncidentByCapability[$capabilityId] ?? null;

                return [
                    'id' => $capabilityId,
                    'status' => (string) $capability->status,
                    'statusLabel' => $capability->statusLabel(),
                    'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
                    'categoryLabel' => 'Domestic (policy scope)',
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
                ];
            })
            ->values();

        $statsQuery = CourierVendorCodCapability::query();
        if ($categoryFilter !== 'all') {
            $statsQuery->whereIn('category', [
                CourierVendorCodCapability::CATEGORY_DOMESTIC,
                CourierVendorCodCapability::CATEGORY_INTERNATIONAL,
                'logistic',
            ]);
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
        $this->assertCapabilityDecisionAllowed($capability);

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
        $this->assertCapabilityDecisionAllowed($capability);

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
            'eventType' => ['nullable', 'string', 'in:all,cod_capability_request_submitted,cod_capability_approved,cod_capability_rejected,cod_integrity_incident_opened,cod_integrity_incident_assigned,cod_integrity_incident_resolved,cod_integrity_incident_dismissed'],
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

        return response()->json([
            'capability' => [
                'id' => (int) $capability->id,
                'vendorName' => (string) ($capability->vendor->name ?? ''),
                'vendorEmail' => (string) ($capability->vendor->email ?? ''),
                'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
                'categoryLabel' => 'Domestic (policy scope)',
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

        $categoryFilter = (string) ($validated['category'] ?? 'all') === 'domestic'
            ? 'domestic'
            : 'all';

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
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
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

    private function assertCapabilityDecisionAllowed(CourierVendorCodCapability $capability): void
    {
        $capabilityId = (int) $capability->id;

        $activeIncident = CourierVendorCodIntegrityIncident::query()
            ->active()
            ->where('courier_vendor_cod_capability_id', $capabilityId)
            ->latest('id')
            ->first();

        if ($activeIncident instanceof CourierVendorCodIntegrityIncident) {
            throw ValidationException::withMessages([
                'capability' => ['An unresolved integrity incident is active. Resolve or dismiss it before changing COD capability status.'],
            ]);
        }

        $integritySummary = $this->verifyCapabilityAuditChain($capabilityId)['summary'];
        if ((bool) ($integritySummary['isValid'] ?? true)) {
            return;
        }

        $latestIncident = CourierVendorCodIntegrityIncident::query()
            ->where('courier_vendor_cod_capability_id', $capabilityId)
            ->latest('id')
            ->first();

        if (!$latestIncident instanceof CourierVendorCodIntegrityIncident) {
            throw ValidationException::withMessages([
                'capability' => ['Audit chain integrity has issues. Open and resolve an integrity incident before changing COD capability status.'],
            ]);
        }

        $latestStatus = CourierVendorCodIntegrityIncident::normalizeStatus((string) $latestIncident->status);
        if (in_array($latestStatus, [CourierVendorCodIntegrityIncident::STATUS_RESOLVED, CourierVendorCodIntegrityIncident::STATUS_DISMISSED], true)) {
            return;
        }

        throw ValidationException::withMessages([
            'capability' => ['Audit chain integrity has issues. Open and resolve an integrity incident before changing COD capability status.'],
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
