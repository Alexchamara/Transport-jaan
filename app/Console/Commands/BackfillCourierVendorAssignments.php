<?php

namespace App\Console\Commands;

use App\Models\Courier\CourierShipment;
use App\Services\Courier\CourierVendorAssignmentService;
use Illuminate\Console\Command;

class BackfillCourierVendorAssignments extends Command
{
    protected $signature = 'courier:backfill-vendor-assignments
                            {--dry-run : Preview assignments without writing changes}
                            {--all : Re-evaluate all shipments instead of only unassigned ones}
                            {--chunk=200 : Number of shipments processed per chunk}';

    protected $description = 'Backfill courier shipment vendor assignments using approved courier service registrations';

    public function handle(CourierVendorAssignmentService $assignmentService): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $all = (bool) $this->option('all');
        $chunkSize = max(50, (int) $this->option('chunk'));

        $query = CourierShipment::query()->orderBy('id');

        if (!$all) {
            $query->where(function ($builder) {
                $builder
                    ->whereNull('assigned_vendor_user_id')
                    ->orWhereNull('assigned_vendor_registration_id')
                    ->orWhereNull('assignment_category')
                    ->orWhere('assignment_status', CourierShipment::ASSIGNMENT_STATUS_UNASSIGNED);
            });
        }

        $total = (clone $query)->count();

        if ($total === 0) {
            $this->info('No courier shipments matched the backfill criteria.');
            return self::SUCCESS;
        }

        $this->info('Courier vendor assignment backfill started.');
        $this->line('Mode: ' . ($dryRun ? 'DRY RUN' : 'WRITE'));        
        $this->line('Scope: ' . ($all ? 'All shipments' : 'Only missing/unassigned shipments'));
        $this->line('Shipments to process: ' . $total);
        $this->newLine();

        $progress = $this->output->createProgressBar($total);
        $progress->start();

        $assigned = 0;
        $unassigned = 0;
        $updated = 0;

        $query->chunkById($chunkSize, function ($shipments) use ($assignmentService, $dryRun, &$assigned, &$unassigned, &$updated, $progress) {
            foreach ($shipments as $shipment) {
                $assignment = $assignmentService->determineAssignment($shipment);

                if ($assignment['assignment_status'] === CourierShipment::ASSIGNMENT_STATUS_ASSIGNED) {
                    $assigned++;
                } else {
                    $unassigned++;
                }

                $hasChange =
                    (int) $shipment->assigned_vendor_user_id !== (int) ($assignment['assigned_vendor_user_id'] ?? 0)
                    || (int) $shipment->assigned_vendor_registration_id !== (int) ($assignment['assigned_vendor_registration_id'] ?? 0)
                    || (string) ($shipment->assignment_category ?? '') !== (string) ($assignment['assignment_category'] ?? '')
                    || (string) ($shipment->assignment_status ?? '') !== (string) ($assignment['assignment_status'] ?? '');

                if (!$dryRun && $hasChange) {
                    $assignmentService->assignShipment($shipment);
                    $updated++;
                }

                $progress->advance();
            }
        });

        $progress->finish();
        $this->newLine(2);

        $this->info('Backfill completed.');
        $this->line('Assigned outcome: ' . $assigned);
        $this->line('Unassigned outcome: ' . $unassigned);

        if ($dryRun) {
            $this->warn('Dry run mode: no records were updated.');
        } else {
            $this->line('Shipments updated: ' . $updated);
        }

        return self::SUCCESS;
    }
}
