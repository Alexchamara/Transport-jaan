<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierVendorCodCapability;
use App\Models\Courier\CourierVendorCodCapabilityAudit;
use App\Models\Courier\CourierVendorCodIntegrityIncident;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class CourierCodComplianceExportService
{
    public const STATUSES = ['all', 'pending', 'approved', 'rejected', 'not_requested'];
    public const CATEGORIES = ['all', 'domestic', 'international', 'logistic'];

    public function buildPackage(array $filters = [], ?int $exportedByUserId = null): array
    {
        $resolvedFilters = $this->resolveFilters($filters);

        $statusFilter = $resolvedFilters['status'];
        $categoryFilter = $resolvedFilters['category'];
        $search = $resolvedFilters['search'];
        $from = $resolvedFilters['from'];
        $to = $resolvedFilters['to'];

        $capabilitiesQuery = CourierVendorCodCapability::query()
            ->with(['vendor:id,name,email,status', 'requester:id,name', 'reviewer:id,name'])
            ->orderByDesc('id');

        if ($statusFilter !== 'all') {
            $capabilitiesQuery->where('status', $statusFilter);
        }

        if ($categoryFilter !== 'all') {
            $capabilitiesQuery->whereIn('category', [
                CourierVendorCodCapability::CATEGORY_DOMESTIC,
                CourierVendorCodCapability::CATEGORY_INTERNATIONAL,
                'logistic',
            ]);
        }

        if ($search !== '') {
            $capabilitiesQuery->whereHas('vendor', function (Builder $builder) use ($search) {
                $builder
                    ->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        if ($from instanceof Carbon) {
            $capabilitiesQuery->where('requested_at', '>=', $from);
        }

        if ($to instanceof Carbon) {
            $capabilitiesQuery->where('requested_at', '<=', $to);
        }

        $capabilities = $capabilitiesQuery->get();
        $capabilityIds = $capabilities
            ->pluck('id')
            ->map(static fn ($id) => (int) $id)
            ->filter(static fn (int $id) => $id > 0)
            ->values();

        $audits = collect();
        $incidents = collect();
        $integrityByCapability = [];
        $activeIncidentByCapability = [];

        if ($capabilityIds->isNotEmpty()) {
            $auditsQuery = CourierVendorCodCapabilityAudit::query()
                ->with(['actor:id,name'])
                ->whereIn('courier_vendor_cod_capability_id', $capabilityIds->all())
                ->orderBy('id');

            if ($from instanceof Carbon) {
                $auditsQuery->where('created_at', '>=', $from);
            }

            if ($to instanceof Carbon) {
                $auditsQuery->where('created_at', '<=', $to);
            }

            $audits = $auditsQuery->get();

            $incidentsQuery = CourierVendorCodIntegrityIncident::query()
                ->with(['creator:id,name', 'assignee:id,name', 'resolver:id,name'])
                ->whereIn('courier_vendor_cod_capability_id', $capabilityIds->all())
                ->orderBy('id');

            if ($from instanceof Carbon) {
                $incidentsQuery->where('created_at', '>=', $from);
            }

            if ($to instanceof Carbon) {
                $incidentsQuery->where('created_at', '<=', $to);
            }

            $incidents = $incidentsQuery->get();

            $integrityByCapability = CourierVendorCodCapabilityAudit::query()
                ->whereIn('courier_vendor_cod_capability_id', $capabilityIds->all())
                ->orderBy('id')
                ->get()
                ->groupBy(static fn (CourierVendorCodCapabilityAudit $audit) => (int) $audit->courier_vendor_cod_capability_id)
                ->map(fn (Collection $events) => $this->buildAuditIntegrityIndex($events->values())['summary'])
                ->all();

            $activeIncidentByCapability = CourierVendorCodIntegrityIncident::query()
                ->whereIn('courier_vendor_cod_capability_id', $capabilityIds->all())
                ->whereIn('status', CourierVendorCodIntegrityIncident::STATUSES_ACTIVE)
                ->orderByDesc('id')
                ->get()
                ->groupBy(static fn (CourierVendorCodIntegrityIncident $incident) => (int) $incident->courier_vendor_cod_capability_id)
                ->map(fn (Collection $rows) => $rows->first())
                ->all();
        }

        return [
            'manifest' => [
                'package' => 'courier_cod_compliance_export',
                'version' => 1,
                'exportedAt' => now()->toIso8601String(),
                'exportedByUserId' => $exportedByUserId,
                'filters' => [
                    'status' => $statusFilter,
                    'category' => $categoryFilter,
                    'search' => $search,
                    'from' => $from?->toDateString(),
                    'to' => $to?->toDateString(),
                ],
                'counts' => [
                    'capabilities' => $capabilities->count(),
                    'audits' => $audits->count(),
                    'incidents' => $incidents->count(),
                    'activeIncidents' => collect($activeIncidentByCapability)->filter()->count(),
                ],
            ],
            'capabilities' => $capabilities
                ->map(function (CourierVendorCodCapability $capability) use ($integrityByCapability, $activeIncidentByCapability) {
                    $capabilityId = (int) $capability->id;
                    $integrity = $integrityByCapability[$capabilityId] ?? [
                        'isValid' => true,
                        'issueCount' => 0,
                        'verifiedEvents' => 0,
                    ];

                    return [
                        'capabilityId' => $capabilityId,
                        'vendorUserId' => (int) ($capability->vendor_user_id ?? 0),
                        'vendorName' => (string) ($capability->vendor->name ?? ''),
                        'vendorEmail' => (string) ($capability->vendor->email ?? ''),
                        'status' => (string) $capability->status,
                        'statusLabel' => $capability->statusLabel(),
                        'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
                        'categoryLabel' => 'Domestic (policy scope)',
                        'requestedAt' => optional($capability->requested_at)->toIso8601String(),
                        'requestedBy' => (string) ($capability->requester->name ?? ''),
                        'requestedNote' => (string) ($capability->requested_note ?? ''),
                        'reviewedAt' => optional($capability->reviewed_at)->toIso8601String(),
                        'reviewedBy' => (string) ($capability->reviewer->name ?? ''),
                        'approvedAt' => optional($capability->approved_at)->toIso8601String(),
                        'expiresAt' => optional($capability->expires_at)->toIso8601String(),
                        'decisionReason' => (string) ($capability->decision_reason ?? ''),
                        'integrity' => $integrity,
                        'activeIncidentId' => (int) data_get($activeIncidentByCapability, $capabilityId . '.id', 0) ?: null,
                    ];
                })
                ->values()
                ->all(),
            'auditEvents' => $audits
                ->map(function (CourierVendorCodCapabilityAudit $audit) {
                    return [
                        'auditId' => (int) $audit->id,
                        'capabilityId' => (int) $audit->courier_vendor_cod_capability_id,
                        'vendorUserId' => (int) $audit->vendor_user_id,
                        'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
                        'eventType' => (string) $audit->event_type,
                        'fromStatus' => (string) ($audit->from_status ?? ''),
                        'toStatus' => (string) ($audit->to_status ?? ''),
                        'actorUserId' => (int) ($audit->actor_user_id ?? 0) ?: null,
                        'actorName' => (string) ($audit->actor->name ?? 'System'),
                        'note' => (string) ($audit->note ?? ''),
                        'source' => (string) data_get($audit->metadata, 'source', ''),
                        'metadata' => is_array($audit->metadata) ? $audit->metadata : [],
                        'previousHash' => (string) ($audit->previous_hash ?? ''),
                        'recordHash' => (string) ($audit->record_hash ?? ''),
                        'createdAt' => optional($audit->created_at)->toIso8601String(),
                    ];
                })
                ->values()
                ->all(),
            'incidents' => $incidents
                ->map(function (CourierVendorCodIntegrityIncident $incident) {
                    return [
                        'incidentId' => (int) $incident->id,
                        'capabilityId' => (int) $incident->courier_vendor_cod_capability_id,
                        'vendorUserId' => (int) $incident->vendor_user_id,
                        'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
                        'status' => CourierVendorCodIntegrityIncident::normalizeStatus((string) $incident->status),
                        'statusLabel' => $incident->statusLabel(),
                        'severity' => CourierVendorCodIntegrityIncident::normalizeSeverity((string) $incident->severity),
                        'severityLabel' => $incident->severityLabel(),
                        'title' => (string) ($incident->title ?? ''),
                        'description' => (string) ($incident->description ?? ''),
                        'detectedIssueCount' => (int) ($incident->detected_issue_count ?? 0),
                        'detectedAt' => optional($incident->detected_at)->toIso8601String(),
                        'createdByUserId' => (int) ($incident->created_by_user_id ?? 0) ?: null,
                        'createdBy' => (string) ($incident->creator->name ?? ''),
                        'assignedToUserId' => (int) ($incident->assigned_to_user_id ?? 0) ?: null,
                        'assignedTo' => (string) ($incident->assignee->name ?? ''),
                        'assignedAt' => optional($incident->assigned_at)->toIso8601String(),
                        'resolvedByUserId' => (int) ($incident->resolved_by_user_id ?? 0) ?: null,
                        'resolvedBy' => (string) ($incident->resolver->name ?? ''),
                        'resolvedAt' => optional($incident->resolved_at)->toIso8601String(),
                        'resolutionNote' => (string) ($incident->resolution_note ?? ''),
                        'integritySnapshot' => is_array($incident->integrity_snapshot) ? $incident->integrity_snapshot : [],
                        'metadata' => is_array($incident->metadata) ? $incident->metadata : [],
                        'createdAt' => optional($incident->created_at)->toIso8601String(),
                        'updatedAt' => optional($incident->updated_at)->toIso8601String(),
                    ];
                })
                ->values()
                ->all(),
        ];
    }

    public function buildFileName(?Carbon $timestamp = null): string
    {
        $resolvedTimestamp = $timestamp instanceof Carbon ? $timestamp : now();

        return 'courier_cod_compliance_package_' . $resolvedTimestamp->format('Ymd_His') . '.json';
    }

    public function encodePackage(array $package): string
    {
        return json_encode($package, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) ?: '{}';
    }

    public function resolveFilters(array $filters = []): array
    {
        $statusFilter = strtolower(trim((string) ($filters['status'] ?? 'all')));
        if (!in_array($statusFilter, self::STATUSES, true)) {
            $statusFilter = 'all';
        }

        $categoryFilterRaw = strtolower(trim((string) ($filters['category'] ?? 'all')));
        if (!in_array($categoryFilterRaw, self::CATEGORIES, true)) {
            $categoryFilterRaw = 'all';
        }

        $categoryFilter = $categoryFilterRaw === 'all'
            ? 'all'
            : CourierVendorCodCapability::CATEGORY_DOMESTIC;

        $search = trim((string) ($filters['search'] ?? ''));

        return [
            'status' => $statusFilter,
            'category' => $categoryFilter,
            'search' => $search,
            'from' => $this->resolveBoundaryDate($filters['from'] ?? null, true),
            'to' => $this->resolveBoundaryDate($filters['to'] ?? null, false),
        ];
    }

    private function resolveBoundaryDate(mixed $value, bool $isStart): ?Carbon
    {
        if ($value instanceof Carbon) {
            return $isStart ? $value->copy()->startOfDay() : $value->copy()->endOfDay();
        }

        $raw = trim((string) ($value ?? ''));
        if ($raw === '') {
            return null;
        }

        $date = Carbon::parse($raw);

        return $isStart ? $date->startOfDay() : $date->endOfDay();
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
}
