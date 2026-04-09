<?php

namespace App\Console\Commands;

use App\Services\Courier\CourierCodIntegrityMonitoringService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RunCourierCodIntegrityMonitor extends Command
{
    protected $signature = 'courier:cod-integrity-monitor
        {--capability= : Scan one COD capability id}
        {--vendor= : Scan one vendor user id}
        {--auto-open : Automatically open incidents when integrity issues are detected}
        {--dry-run : Evaluate without creating incidents or writing audit events}
        {--json : Print the raw monitoring payload as JSON}';

    protected $description = 'Scan COD capability audit chains and optionally auto-open integrity incidents';

    public function handle(CourierCodIntegrityMonitoringService $service): int
    {
        $capabilityId = (int) $this->option('capability');
        $vendorUserId = (int) $this->option('vendor');
        $autoOpen = (bool) $this->option('auto-open');
        $dryRun = (bool) $this->option('dry-run');

        $summary = $service->run(
            $capabilityId > 0 ? $capabilityId : null,
            $vendorUserId > 0 ? $vendorUserId : null,
            $autoOpen,
            $dryRun
        );

        $this->info('Courier COD integrity monitor completed.');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Scanned capabilities', (string) ((int) ($summary['scannedCapabilities'] ?? 0))],
                ['Valid capabilities', (string) ((int) ($summary['validCapabilities'] ?? 0))],
                ['Compromised capabilities', (string) ((int) ($summary['compromisedCapabilities'] ?? 0))],
                ['Opened incidents', (string) ((int) ($summary['openedIncidents'] ?? 0))],
                ['Existing active incidents', (string) ((int) ($summary['activeIncidentsFound'] ?? 0))],
                ['Detected without incident', (string) ((int) ($summary['detectedWithoutIncident'] ?? 0))],
                ['Auto-open mode', $autoOpen ? 'yes' : 'no'],
                ['Dry run', $dryRun ? 'yes' : 'no'],
            ]
        );

        if ($this->option('json')) {
            $this->newLine();
            $this->line(json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) ?: '{}');
        }

        if (((int) ($summary['compromisedCapabilities'] ?? 0)) > 0) {
            Log::warning('COURIER COD INTEGRITY MONITOR COMPROMISED CAPABILITIES DETECTED', [
                'summary' => $summary,
            ]);
        } else {
            Log::info('COURIER COD INTEGRITY MONITOR PASS', [
                'summary' => $summary,
            ]);
        }

        return self::SUCCESS;
    }
}
