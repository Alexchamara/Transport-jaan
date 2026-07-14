<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierVendorCodCapability;
use App\Models\Courier\CourierVendorCodCapabilityAudit;
use App\Models\Courier\CourierVendorCodIntegrityIncident;
use Illuminate\Support\Collection;

class CourierCodIntegrityMonitoringService
{
    public function __construct(private readonly CourierCodIntegrityAlertService $alerts)
    {
    }

    public function run(
        ?int $capabilityId = null,
        ?int $vendorUserId = null,
        bool $autoOpen = false,
        bool $dryRun = false
    ): array {
        $summary = [
            'scannedCapabilities' => 0,
            'validCapabilities' => 0,
            'compromisedCapabilities' => 0,
            'openedIncidents' => 0,
            'activeIncidentsFound' => 0,
            'detectedWithoutIncident' => 0,
            'autoOpen' => $autoOpen,
            'dryRun' => $dryRun,
            'issues' => [],
        ];

        $query = CourierVendorCodCapability::query()
            ->orderBy('id');

        if ($capabilityId !== null && $capabilityId > 0) {
            $query->where('id', $capabilityId);
        }

        if ($vendorUserId !== null && $vendorUserId > 0) {
            $query->where('vendor_user_id', $vendorUserId);
        }

        $chunkSize = max(25, (int) config('courier.cod_integrity.monitor.scan_chunk_size', 100));

        $query->chunkById($chunkSize, function (Collection $capabilities) use (&$summary, $autoOpen, $dryRun) {
            foreach ($capabilities as $capability) {
                /** @var CourierVendorCodCapability $capability */
                $summary['scannedCapabilities']++;

                $integrityIndex = $this->verifyCapabilityAuditChain((int) $capability->id);
                $integritySummary = $integrityIndex['summary'];

                if ((bool) ($integritySummary['isValid'] ?? true)) {
                    $summary['validCapabilities']++;
                    continue;
                }

                $summary['compromisedCapabilities']++;

                $activeIncident = CourierVendorCodIntegrityIncident::query()
                    ->active()
                    ->where('courier_vendor_cod_capability_id', (int) $capability->id)
                    ->latest('id')
                    ->first();

                if ($activeIncident instanceof CourierVendorCodIntegrityIncident) {
                    $summary['activeIncidentsFound']++;
                    $summary['issues'][] = [
                        'capabilityId' => (int) $capability->id,
                        'vendorUserId' => (int) $capability->vendor_user_id,
                        'issueCount' => (int) ($integritySummary['issueCount'] ?? 0),
                        'incidentId' => (int) $activeIncident->id,
                        'action' => 'already_active',
                    ];
                    continue;
                }

                if (!$autoOpen) {
                    $summary['detectedWithoutIncident']++;
                    $summary['issues'][] = [
                        'capabilityId' => (int) $capability->id,
                        'vendorUserId' => (int) $capability->vendor_user_id,
                        'issueCount' => (int) ($integritySummary['issueCount'] ?? 0),
                        'incidentId' => null,
                        'action' => 'detected_no_auto_open',
                    ];
                    continue;
                }

                if ($dryRun) {
                    $summary['issues'][] = [
                        'capabilityId' => (int) $capability->id,
                        'vendorUserId' => (int) $capability->vendor_user_id,
                        'issueCount' => (int) ($integritySummary['issueCount'] ?? 0),
                        'incidentId' => null,
                        'action' => 'dry_run_skipped',
                    ];
                    continue;
                }

                $incident = $this->openIncidentFromMonitor($capability, $integrityIndex, $integritySummary);
                $summary['openedIncidents']++;
                $summary['issues'][] = [
                    'capabilityId' => (int) $capability->id,
                    'vendorUserId' => (int) $capability->vendor_user_id,
                    'issueCount' => (int) ($integritySummary['issueCount'] ?? 0),
                    'incidentId' => (int) $incident->id,
                    'action' => 'opened',
                ];
            }
        });

        return $summary;
    }

    private function openIncidentFromMonitor(
        CourierVendorCodCapability $capability,
        array $integrityIndex,
        array $integritySummary
    ): CourierVendorCodIntegrityIncident {
        $issueCount = (int) ($integritySummary['issueCount'] ?? 0);

        $severity = $issueCount >= 3
            ? CourierVendorCodIntegrityIncident::SEVERITY_CRITICAL
            : CourierVendorCodIntegrityIncident::SEVERITY_HIGH;

        $issueEvents = collect($integrityIndex['events'] ?? [])
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
            'title' => 'Auto-detected COD audit integrity issue',
            'description' => 'Automated monitor detected audit hash-chain integrity mismatches for this COD capability.',
            'detected_issue_count' => $issueCount,
            'integrity_snapshot' => [
                'summary' => $integritySummary,
                'issues' => $issueEvents,
            ],
            'detected_at' => now(),
            'created_by_user_id' => null,
            'metadata' => [
                'source' => 'cod_integrity_monitor',
            ],
        ]);

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_integrity_incident_opened',
            (string) $capability->status,
            (string) $capability->status,
            null,
            'Incident opened by automated COD integrity monitor.',
            [
                'source' => 'cod_integrity_monitor',
                'incident_id' => (int) $incident->id,
                'incident_status' => CourierVendorCodIntegrityIncident::STATUS_OPEN,
                'incident_severity' => $severity,
                'incident_issue_count' => $issueCount,
            ]
        );

        $this->alerts->incidentOpened($incident, [
            'source' => 'cod_integrity_monitor',
            'trigger' => 'automated_monitor',
        ]);

        return $incident;
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
