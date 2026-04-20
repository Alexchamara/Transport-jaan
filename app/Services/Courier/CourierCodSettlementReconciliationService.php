<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierCodSettlementBatch;
use App\Models\Courier\CourierCodSettlementLine;
use App\Models\Courier\CourierCodSettlementSetting;
use App\Models\Courier\CourierShipment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CourierCodSettlementReconciliationService
{
    private const ELIGIBLE_COLLECTION_STATUSES = ['collected', 'partially_collected'];

    /**
     * @param  array{fromDate:string,toDate:string,category:string,note?:string|null}  $payload
     */
    public function generateBatch(array $payload, ?int $actorUserId = null): CourierCodSettlementBatch
    {
        $category = $this->normalizeBatchCategory((string) ($payload['category'] ?? CourierCodSettlementBatch::CATEGORY_ALL));
        $fromDate = Carbon::parse((string) $payload['fromDate'])->startOfDay();
        $toDate = Carbon::parse((string) $payload['toDate'])->endOfDay();
        $note = trim((string) ($payload['note'] ?? ''));

        if ($toDate->lt($fromDate)) {
            throw ValidationException::withMessages([
                'toDate' => 'Cycle end date must be greater than or equal to cycle start date.',
            ]);
        }

        /** @var CourierCodSettlementSetting $settings */
        $settings = CourierCodSettlementSetting::query()->firstOrCreate(
            [],
            [
                'is_cod_enabled' => true,
                'settlement_cycle_days' => 7,
                'holding_days' => 1,
                'reserve_percentage' => 2.5,
                'minimum_payout_amount' => 500,
                'currency_code' => 'LKR',
            ]
        );

        $currencyCode = strtoupper((string) ($settings->currency_code ?: 'LKR'));
        $reserveRate = max(0.0, (float) $settings->reserve_percentage);

        return DB::transaction(function () use (
            $actorUserId,
            $category,
            $currencyCode,
            $fromDate,
            $note,
            $reserveRate,
            $settings,
            $toDate,
        ): CourierCodSettlementBatch {
            $batch = CourierCodSettlementBatch::query()->create([
                'batch_reference' => CourierCodSettlementBatch::generateReference(),
                'category' => $category,
                'status' => CourierCodSettlementBatch::STATUS_DRAFT,
                'reconciliation_status' => CourierCodSettlementBatch::RECON_STATUS_BALANCED,
                'currency_code' => $currencyCode,
                'cycle_start_date' => $fromDate->toDateString(),
                'cycle_end_date' => $toDate->toDateString(),
                'shipment_count' => 0,
                'gross_cod_amount' => 0,
                'reserve_amount' => 0,
                'net_payout_amount' => 0,
                'discrepancy_amount' => 0,
                'generated_by_user_id' => $actorUserId,
                'generated_at' => now(),
                'metadata' => [
                    'settings_snapshot' => [
                        'reserve_percentage' => (float) $settings->reserve_percentage,
                        'minimum_payout_amount' => (float) $settings->minimum_payout_amount,
                        'holding_days' => (int) $settings->holding_days,
                        'settlement_cycle_days' => (int) $settings->settlement_cycle_days,
                    ],
                ],
            ]);

            $shipments = $this->eligibleShipmentQuery($fromDate, $toDate, $category)->get();

            $shipmentCount = 0;
            $grossAmount = 0.0;
            $reserveAmount = 0.0;
            $netPayoutAmount = 0.0;
            $discrepancyAmount = 0.0;
            $pendingLineCount = 0;

            foreach ($shipments as $shipment) {
                $shipmentCount++;

                $requestedAmount = max(0.0, round((float) ($shipment->cod_requested_amount ?? 0), 2));
                $collectedAmount = max(0.0, round((float) ($shipment->cod_collected_amount ?? 0), 2));

                if ($collectedAmount <= 0.0 && $requestedAmount > 0.0 && (string) $shipment->cod_collection_status === 'collected') {
                    $collectedAmount = $requestedAmount;
                }

                $reserveLineAmount = round(($collectedAmount * $reserveRate) / 100, 2);
                $payoutAmount = max(0.0, round($collectedAmount - $reserveLineAmount, 2));
                $lineDiscrepancyAmount = max(0.0, round($requestedAmount - $collectedAmount, 2));
                $lineStatus = $lineDiscrepancyAmount > 0.0
                    ? CourierCodSettlementLine::STATUS_PENDING_RECONCILIATION
                    : CourierCodSettlementLine::STATUS_PAYOUT_READY;

                if ($lineStatus === CourierCodSettlementLine::STATUS_PENDING_RECONCILIATION) {
                    $pendingLineCount++;
                }

                $grossAmount += $collectedAmount;
                $reserveAmount += $reserveLineAmount;
                $netPayoutAmount += $payoutAmount;
                $discrepancyAmount += $lineDiscrepancyAmount;

                CourierCodSettlementLine::query()->create([
                    'courier_cod_settlement_batch_id' => $batch->id,
                    'shipment_id' => $shipment->id,
                    'vendor_user_id' => $shipment->assigned_vendor_user_id,
                    'cod_capability_id' => $shipment->cod_capability_id,
                    'line_status' => $lineStatus,
                    'currency_code' => $currencyCode,
                    'requested_cod_amount' => $requestedAmount,
                    'collected_cod_amount' => $collectedAmount,
                    'reserve_amount' => $reserveLineAmount,
                    'payout_amount' => $payoutAmount,
                    'discrepancy_amount' => $lineDiscrepancyAmount,
                    'metadata' => [
                        'source' => [
                            'shipment_reference' => (string) ($shipment->reference ?? ''),
                            'collection_status' => (string) ($shipment->cod_collection_status ?? ''),
                            'collection_recorded_at' => optional($shipment->cod_collection_recorded_at)->toDateTimeString(),
                        ],
                    ],
                ]);
            }

            $batch->shipment_count = $shipmentCount;
            $batch->setAttribute('gross_cod_amount', round($grossAmount, 2));
            $batch->setAttribute('reserve_amount', round($reserveAmount, 2));
            $batch->setAttribute('net_payout_amount', round($netPayoutAmount, 2));
            $batch->setAttribute('discrepancy_amount', round($discrepancyAmount, 2));
            $batch->status = $shipmentCount === 0
                ? CourierCodSettlementBatch::STATUS_DRAFT
                : ($pendingLineCount > 0 ? CourierCodSettlementBatch::STATUS_RECONCILING : CourierCodSettlementBatch::STATUS_READY_FOR_PAYOUT);
            $batch->reconciliation_status = $pendingLineCount > 0
                ? CourierCodSettlementBatch::RECON_STATUS_ISSUES_DETECTED
                : CourierCodSettlementBatch::RECON_STATUS_BALANCED;

            $metadata = $batch->metadata ?? [];
            $metadata['generation_note'] = $note !== '' ? $note : null;
            $metadata['event_log'] = $this->appendEvent(
                $metadata['event_log'] ?? [],
                'batch_generated',
                $actorUserId,
                [
                    'cycle_start_date' => $fromDate->toDateString(),
                    'cycle_end_date' => $toDate->toDateString(),
                    'category' => $category,
                    'shipments' => $shipmentCount,
                ]
            );
            $batch->metadata = $metadata;
            $batch->save();

            return $batch->fresh(['generatedBy']);
        });
    }

    public function reconcileLine(
        CourierCodSettlementLine $line,
        ?float $collectedAmount,
        ?string $note,
        ?int $actorUserId = null
    ): CourierCodSettlementLine {
        return DB::transaction(function () use ($actorUserId, $collectedAmount, $line, $note): CourierCodSettlementLine {
            $line->loadMissing('batch');

            if ($line->batch === null) {
                throw ValidationException::withMessages([
                    'line' => 'Settlement batch not found for this line.',
                ]);
            }

            if (in_array($line->batch->status, [CourierCodSettlementBatch::STATUS_EXPORTED, CourierCodSettlementBatch::STATUS_CLOSED], true)) {
                throw ValidationException::withMessages([
                    'line' => 'Cannot reconcile lines for an exported or closed batch.',
                ]);
            }

            $effectiveCollectedAmount = $collectedAmount !== null
                ? max(0.0, round((float) $collectedAmount, 2))
                : max(0.0, round((float) $line->collected_cod_amount, 2));

            [$reserveAmount, $payoutAmount, $discrepancyAmount] = $this->recalculateLineAmounts($line, $effectiveCollectedAmount);

            $line->setAttribute('collected_cod_amount', $effectiveCollectedAmount);
            $line->setAttribute('reserve_amount', $reserveAmount);
            $line->setAttribute('payout_amount', $payoutAmount);
            $line->setAttribute('discrepancy_amount', $discrepancyAmount);
            $line->line_status = $discrepancyAmount > 0.0
                ? CourierCodSettlementLine::STATUS_PENDING_RECONCILIATION
                : CourierCodSettlementLine::STATUS_PAYOUT_READY;

            if ($line->dispute_status === CourierCodSettlementLine::DISPUTE_STATUS_OPEN) {
                $line->dispute_status = CourierCodSettlementLine::DISPUTE_STATUS_RESOLVED;
            }

            $line->reconciled_by_user_id = $actorUserId;
            $line->reconciled_at = Carbon::now();

            $metadata = $line->metadata ?? [];
            $metadata['event_log'] = $this->appendEvent(
                $metadata['event_log'] ?? [],
                'line_reconciled',
                $actorUserId,
                [
                    'collected_amount' => $effectiveCollectedAmount,
                    'note' => trim((string) $note) !== '' ? trim((string) $note) : null,
                ]
            );
            $line->metadata = $metadata;
            $line->save();

            $this->refreshBatch($line->batch, $actorUserId);

            return $line->fresh(['vendor', 'shipment']);
        });
    }

    public function openDispute(CourierCodSettlementLine $line, string $reason, ?string $note, ?int $actorUserId = null): CourierCodSettlementLine
    {
        return DB::transaction(function () use ($actorUserId, $line, $note, $reason): CourierCodSettlementLine {
            $line->loadMissing('batch');

            if ($line->batch === null) {
                throw ValidationException::withMessages([
                    'line' => 'Settlement batch not found for this line.',
                ]);
            }

            if (in_array($line->batch->status, [CourierCodSettlementBatch::STATUS_EXPORTED, CourierCodSettlementBatch::STATUS_CLOSED], true)) {
                throw ValidationException::withMessages([
                    'line' => 'Cannot open disputes for an exported or closed batch.',
                ]);
            }

            $line->line_status = CourierCodSettlementLine::STATUS_DISPUTED;
            $line->dispute_status = CourierCodSettlementLine::DISPUTE_STATUS_OPEN;
            $line->dispute_reason = trim($reason);
            $line->dispute_note = trim((string) $note) !== '' ? trim((string) $note) : null;
            $line->reconciled_by_user_id = $actorUserId;
            $line->reconciled_at = Carbon::now();

            $metadata = $line->metadata ?? [];
            $metadata['event_log'] = $this->appendEvent(
                $metadata['event_log'] ?? [],
                'line_dispute_opened',
                $actorUserId,
                [
                    'reason' => $line->dispute_reason,
                    'note' => $line->dispute_note,
                ]
            );
            $line->metadata = $metadata;
            $line->save();

            $this->refreshBatch($line->batch, $actorUserId);

            return $line->fresh(['vendor', 'shipment']);
        });
    }

    public function resolveDispute(
        CourierCodSettlementLine $line,
        string $resolution,
        ?float $collectedAmount,
        ?string $note,
        ?int $actorUserId = null
    ): CourierCodSettlementLine {
        return DB::transaction(function () use ($actorUserId, $collectedAmount, $line, $note, $resolution): CourierCodSettlementLine {
            $line->loadMissing('batch');

            if ($line->batch === null) {
                throw ValidationException::withMessages([
                    'line' => 'Settlement batch not found for this line.',
                ]);
            }

            if (in_array($line->batch->status, [CourierCodSettlementBatch::STATUS_EXPORTED, CourierCodSettlementBatch::STATUS_CLOSED], true)) {
                throw ValidationException::withMessages([
                    'line' => 'Cannot resolve disputes for an exported or closed batch.',
                ]);
            }

            $normalizedResolution = $this->normalizeResolution($resolution);

            $effectiveCollectedAmount = $collectedAmount !== null
                ? max(0.0, round((float) $collectedAmount, 2))
                : max(0.0, round((float) $line->collected_cod_amount, 2));

            [$reserveAmount, $payoutAmount, $discrepancyAmount] = $this->recalculateLineAmounts($line, $effectiveCollectedAmount);

            $line->setAttribute('collected_cod_amount', $effectiveCollectedAmount);
            $line->setAttribute('reserve_amount', $reserveAmount);
            $line->setAttribute('discrepancy_amount', $discrepancyAmount);
            $line->reconciled_by_user_id = $actorUserId;
            $line->reconciled_at = Carbon::now();
            $line->dispute_note = trim((string) $note) !== '' ? trim((string) $note) : $line->dispute_note;

            if ($normalizedResolution === 'payout_ready') {
                $line->line_status = CourierCodSettlementLine::STATUS_PAYOUT_READY;
                $line->dispute_status = CourierCodSettlementLine::DISPUTE_STATUS_RESOLVED;
                $line->setAttribute('payout_amount', $payoutAmount);
            } elseif ($normalizedResolution === 'withheld') {
                $line->line_status = CourierCodSettlementLine::STATUS_WITHHELD;
                $line->dispute_status = CourierCodSettlementLine::DISPUTE_STATUS_RESOLVED;
                $line->setAttribute('payout_amount', 0.0);
            } else {
                $line->line_status = CourierCodSettlementLine::STATUS_PENDING_RECONCILIATION;
                $line->dispute_status = CourierCodSettlementLine::DISPUTE_STATUS_REJECTED;
                $line->setAttribute('payout_amount', $payoutAmount);
            }

            $metadata = $line->metadata ?? [];
            $metadata['event_log'] = $this->appendEvent(
                $metadata['event_log'] ?? [],
                'line_dispute_resolved',
                $actorUserId,
                [
                    'resolution' => $normalizedResolution,
                    'note' => $line->dispute_note,
                ]
            );
            $line->metadata = $metadata;
            $line->save();

            $this->refreshBatch($line->batch, $actorUserId);

            return $line->fresh(['vendor', 'shipment']);
        });
    }

    public function markBatchExported(CourierCodSettlementBatch $batch, ?int $actorUserId = null, ?string $note = null): CourierCodSettlementBatch
    {
        return DB::transaction(function () use ($actorUserId, $batch, $note): CourierCodSettlementBatch {
            $this->refreshBatch($batch, $actorUserId);
            $batch->refresh();

            if ($batch->status !== CourierCodSettlementBatch::STATUS_READY_FOR_PAYOUT) {
                throw ValidationException::withMessages([
                    'batch' => 'Only payout-ready batches can be exported.',
                ]);
            }

            $batch->status = CourierCodSettlementBatch::STATUS_EXPORTED;
            $batch->exported_by_user_id = $actorUserId;
            $batch->exported_at = Carbon::now();
            $batch->reconciliation_status = CourierCodSettlementBatch::RECON_STATUS_FINALIZED;

            $metadata = $batch->metadata ?? [];
            $metadata['event_log'] = $this->appendEvent(
                $metadata['event_log'] ?? [],
                'batch_exported',
                $actorUserId,
                [
                    'note' => trim((string) $note) !== '' ? trim((string) $note) : null,
                ]
            );
            $batch->metadata = $metadata;
            $batch->save();

            return $batch->fresh(['generatedBy', 'reconciledBy', 'exportedBy']);
        });
    }

    public function buildPayoutReadyRows(CourierCodSettlementBatch $batch): Collection
    {
        return CourierCodSettlementLine::query()
            ->with(['vendor:id,name,email', 'shipment:id,reference'])
            ->where('courier_cod_settlement_batch_id', $batch->id)
            ->where('line_status', CourierCodSettlementLine::STATUS_PAYOUT_READY)
            ->orderBy('id')
            ->get()
            ->map(function (CourierCodSettlementLine $line) use ($batch): array {
                return [
                    'batch_reference' => (string) $batch->batch_reference,
                    'shipment_reference' => $line->shipment?->reference,
                    'vendor_name' => $line->vendor?->name,
                    'vendor_email' => $line->vendor?->email,
                    'requested_cod_amount' => (float) $line->requested_cod_amount,
                    'collected_cod_amount' => (float) $line->collected_cod_amount,
                    'reserve_amount' => (float) $line->reserve_amount,
                    'payout_amount' => (float) $line->payout_amount,
                    'currency_code' => $line->currency_code,
                    'line_status' => $line->line_status,
                    'line_status_label' => $line->lineStatusLabel(),
                ];
            });
    }

    public function buildPayoutReadyCsv(CourierCodSettlementBatch $batch): string
    {
        $rows = $this->buildPayoutReadyRows($batch);
        $handle = fopen('php://temp', 'r+');

        if ($handle === false) {
            throw ValidationException::withMessages([
                'batch' => 'Unable to generate payout export.',
            ]);
        }

        fputcsv($handle, [
            'Batch Reference',
            'Shipment Reference',
            'Vendor Name',
            'Vendor Email',
            'Requested COD Amount',
            'Collected COD Amount',
            'Reserve Amount',
            'Payout Amount',
            'Currency',
            'Line Status',
        ]);

        foreach ($rows as $row) {
            fputcsv($handle, [
                $row['batch_reference'],
                $row['shipment_reference'],
                $row['vendor_name'],
                $row['vendor_email'],
                number_format((float) $row['requested_cod_amount'], 2, '.', ''),
                number_format((float) $row['collected_cod_amount'], 2, '.', ''),
                number_format((float) $row['reserve_amount'], 2, '.', ''),
                number_format((float) $row['payout_amount'], 2, '.', ''),
                $row['currency_code'],
                $row['line_status_label'],
            ]);
        }

        rewind($handle);
        $contents = stream_get_contents($handle);
        fclose($handle);

        return $contents !== false ? $contents : '';
    }

    public function refreshBatch(CourierCodSettlementBatch $batch, ?int $actorUserId = null): CourierCodSettlementBatch
    {
        $aggregate = CourierCodSettlementLine::query()
            ->where('courier_cod_settlement_batch_id', $batch->id)
            ->selectRaw('COUNT(*) as line_count')
            ->selectRaw('COALESCE(SUM(collected_cod_amount), 0) as gross_cod_amount')
            ->selectRaw('COALESCE(SUM(reserve_amount), 0) as reserve_amount')
            ->selectRaw('COALESCE(SUM(payout_amount), 0) as net_payout_amount')
            ->selectRaw('COALESCE(SUM(discrepancy_amount), 0) as discrepancy_amount')
            ->selectRaw("SUM(CASE WHEN line_status = ? THEN 1 ELSE 0 END) as payout_ready_count", [CourierCodSettlementLine::STATUS_PAYOUT_READY])
            ->selectRaw("SUM(CASE WHEN line_status IN (?, ?) THEN 1 ELSE 0 END) as pending_count", [CourierCodSettlementLine::STATUS_PENDING_RECONCILIATION, CourierCodSettlementLine::STATUS_DISPUTED])
            ->selectRaw("SUM(CASE WHEN dispute_status = ? THEN 1 ELSE 0 END) as dispute_open_count", [CourierCodSettlementLine::DISPUTE_STATUS_OPEN])
            ->first();

        $lineCount = (int) ($aggregate?->line_count ?? 0);
        $pendingCount = (int) ($aggregate?->pending_count ?? 0);
        $disputeOpenCount = (int) ($aggregate?->dispute_open_count ?? 0);

        $status = $batch->status;
        $reconciliationStatus = $batch->reconciliation_status;

        if ($lineCount === 0) {
            $status = CourierCodSettlementBatch::STATUS_DRAFT;
            $reconciliationStatus = CourierCodSettlementBatch::RECON_STATUS_BALANCED;
        } elseif ($disputeOpenCount > 0) {
            $status = CourierCodSettlementBatch::STATUS_RECONCILING;
            $reconciliationStatus = CourierCodSettlementBatch::RECON_STATUS_DISPUTE_OPEN;
        } elseif ($pendingCount > 0) {
            $status = CourierCodSettlementBatch::STATUS_RECONCILING;
            $reconciliationStatus = CourierCodSettlementBatch::RECON_STATUS_ISSUES_DETECTED;
        } elseif (! in_array($batch->status, [CourierCodSettlementBatch::STATUS_EXPORTED, CourierCodSettlementBatch::STATUS_CLOSED], true)) {
            $status = CourierCodSettlementBatch::STATUS_READY_FOR_PAYOUT;
            $reconciliationStatus = CourierCodSettlementBatch::RECON_STATUS_BALANCED;
        } elseif ($batch->status === CourierCodSettlementBatch::STATUS_EXPORTED) {
            $reconciliationStatus = CourierCodSettlementBatch::RECON_STATUS_FINALIZED;
        }

        $batch->shipment_count = $lineCount;
        $batch->setAttribute('gross_cod_amount', round((float) ($aggregate?->gross_cod_amount ?? 0), 2));
        $batch->setAttribute('reserve_amount', round((float) ($aggregate?->reserve_amount ?? 0), 2));
        $batch->setAttribute('net_payout_amount', round((float) ($aggregate?->net_payout_amount ?? 0), 2));
        $batch->setAttribute('discrepancy_amount', round((float) ($aggregate?->discrepancy_amount ?? 0), 2));
        $batch->status = $status;
        $batch->reconciliation_status = $reconciliationStatus;

        if ($status === CourierCodSettlementBatch::STATUS_READY_FOR_PAYOUT && $batch->reconciled_at === null) {
            $batch->reconciled_at = Carbon::now();
            if ($actorUserId !== null) {
                $batch->reconciled_by_user_id = $actorUserId;
            }
        }

        $batch->save();

        return $batch->refresh();
    }

    private function eligibleShipmentQuery(Carbon $fromDate, Carbon $toDate, string $category): Builder
    {
        return CourierShipment::query()
            ->where('is_cod_enabled', true)
            ->where('status', 'delivered')
            ->whereBetween('cod_collection_recorded_at', [$fromDate, $toDate])
            ->whereIn('cod_collection_status', self::ELIGIBLE_COLLECTION_STATUSES)
            ->whereNotExists(function ($subquery): void {
                $subquery
                    ->selectRaw('1')
                    ->from('courier_cod_settlement_lines as settlement_lines')
                    ->join('courier_cod_settlement_batches as settlement_batches', 'settlement_batches.id', '=', 'settlement_lines.courier_cod_settlement_batch_id')
                    ->whereColumn('settlement_lines.shipment_id', 'courier_shipments.id')
                    ->whereIn('settlement_batches.status', [
                        CourierCodSettlementBatch::STATUS_RECONCILING,
                        CourierCodSettlementBatch::STATUS_READY_FOR_PAYOUT,
                        CourierCodSettlementBatch::STATUS_EXPORTED,
                    ]);
            })
            ->when($category === CourierCodSettlementBatch::CATEGORY_DOMESTIC, function (Builder $query): void {
                $query->where('assignment_category', 'domestic');
            })
            ->when($category === CourierCodSettlementBatch::CATEGORY_INTERNATIONAL, function (Builder $query): void {
                $query->whereIn('assignment_category', ['international', 'logistic']);
            });
    }

    /**
     * @return array{0:float,1:float,2:float}
     */
    private function recalculateLineAmounts(CourierCodSettlementLine $line, float $collectedAmount): array
    {
        $batch = $line->batch;
        $reserveRate = 0.0;

        if ($batch !== null && (float) $batch->gross_cod_amount > 0.0) {
            $reserveRate = ((float) $batch->reserve_amount / (float) $batch->gross_cod_amount) * 100;
        }

        $reserveAmount = round(($collectedAmount * $reserveRate) / 100, 2);
        $payoutAmount = max(0.0, round($collectedAmount - $reserveAmount, 2));
        $requestedAmount = max(0.0, round((float) $line->requested_cod_amount, 2));
        $discrepancyAmount = max(0.0, round($requestedAmount - $collectedAmount, 2));

        return [$reserveAmount, $payoutAmount, $discrepancyAmount];
    }

    /**
     * @param  array<int, array<string, mixed>>  $events
     * @param  array<string, mixed>  $payload
     * @return array<int, array<string, mixed>>
     */
    private function appendEvent(array $events, string $type, ?int $actorUserId, array $payload = []): array
    {
        $events[] = [
            'type' => $type,
            'actor_user_id' => $actorUserId,
            'at' => now()->toIso8601String(),
            'payload' => $payload,
        ];

        if (count($events) > 100) {
            $events = array_slice($events, -100);
        }

        return $events;
    }

    private function normalizeBatchCategory(string $category): string
    {
        $normalized = strtolower(trim($category));

        if (in_array($normalized, [
            CourierCodSettlementBatch::CATEGORY_DOMESTIC,
            CourierCodSettlementBatch::CATEGORY_INTERNATIONAL,
            CourierCodSettlementBatch::CATEGORY_ALL,
        ], true)) {
            return $normalized;
        }

        return CourierCodSettlementBatch::CATEGORY_ALL;
    }

    private function normalizeResolution(string $resolution): string
    {
        $normalized = strtolower(trim($resolution));

        if (in_array($normalized, ['payout_ready', 'withheld', 'rejected'], true)) {
            return $normalized;
        }

        throw ValidationException::withMessages([
            'resolution' => 'Unsupported dispute resolution option.',
        ]);
    }

}
