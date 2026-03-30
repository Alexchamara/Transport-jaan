<?php

namespace App\Console\Commands;

use App\Services\Courier\CourierPhaseSevenMonitoringService;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RunCourierPhaseSevenMonitor extends Command
{
    protected $signature = 'courier:phase7-monitor
        {--hours=24 : Lookback window in hours}
        {--log= : Override Laravel log file path}
        {--publish-summary : Append metrics snapshot to post-implementation summary doc}
        {--summary-path= : Custom summary markdown file path (relative or absolute)}
        {--json : Print the raw metrics payload as JSON}';

    protected $description = 'Run courier Phase 7 canary monitoring and evaluate fallback criteria';

    public function handle(CourierPhaseSevenMonitoringService $monitoringService): int
    {
        $hours = max(1, (int) $this->option('hours'));
        $windowEnd = CarbonImmutable::now();
        $windowStart = $windowEnd->subHours($hours);
        $logPath = trim((string) $this->option('log'));

        $metrics = $monitoringService->collectMetrics(
            $windowStart,
            $windowEnd,
            $logPath !== '' ? $logPath : null
        );

        $checklist = $monitoringService->releaseChecklist();

        $this->info('Courier Phase 7 monitoring window: ' . $metrics['window_start'] . ' -> ' . $metrics['window_end']);
        $this->line('Canary window target: ' . (int) $metrics['canary_window_hours'] . ' hours');

        $this->newLine();
        $this->line('Release checklist:');
        foreach ($checklist as $index => $item) {
            $this->line(($index + 1) . '. ' . $item);
        }

        $thresholds = is_array($metrics['threshold_status']['thresholds'] ?? null)
            ? $metrics['threshold_status']['thresholds']
            : [];

        $this->newLine();
        $this->table(
            ['Metric', 'Actual', 'Threshold'],
            [
                [
                    'Total shipments in window',
                    (string) ((int) $metrics['total_shipments']),
                    '>= ' . (int) ($thresholds['minimum_sample_size'] ?? 0),
                ],
                [
                    'Conversion rate',
                    number_format((float) $metrics['conversion_rate_percent'], 2) . '%',
                    '>= ' . number_format((float) ($thresholds['min_conversion_rate_percent'] ?? 0), 2) . '%',
                ],
                [
                    'Error signal rate',
                    number_format((float) $metrics['error_rate_percent'], 2) . '%',
                    '<= ' . number_format((float) ($thresholds['max_error_rate_percent'] ?? 0), 2) . '%',
                ],
                [
                    'Support signal proxy rate',
                    number_format((float) $metrics['support_signal_rate_percent'], 2) . '%',
                    '<= ' . number_format((float) ($thresholds['max_support_signal_rate_percent'] ?? 0), 2) . '%',
                ],
                [
                    'Critical alerts',
                    (string) ((int) $metrics['critical_alert_count']),
                    '<= ' . (int) ($thresholds['max_critical_alerts'] ?? 0),
                ],
            ]
        );

        if ($this->option('json')) {
            $this->newLine();
            $this->line(json_encode($metrics, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) ?: '{}');
        }

        $fallbackRequired = (bool) ($metrics['threshold_status']['fallback_required'] ?? false);
        $insufficientData = (bool) ($metrics['threshold_status']['insufficient_data'] ?? false);
        $breaches = is_array($metrics['threshold_status']['breaches'] ?? null)
            ? $metrics['threshold_status']['breaches']
            : [];

        if ($fallbackRequired) {
            $this->newLine();
            $this->warn('Fallback criteria breached. Stabilization patch is required before widening rollout.');

            foreach ($breaches as $breach) {
                $this->line('- ' . (string) ($breach['code'] ?? 'unknown') . ': ' . (string) ($breach['message'] ?? ''));
            }

            Log::warning('COURIER PHASE7 FALLBACK ADVISED', [
                'window_start' => $metrics['window_start'] ?? null,
                'window_end' => $metrics['window_end'] ?? null,
                'insufficient_data' => $insufficientData,
                'breaches' => $breaches,
            ]);
        } elseif ($insufficientData) {
            $this->newLine();
            $this->warn('Insufficient shipment volume for full threshold evaluation. Continue canary and collect more samples.');

            Log::info('COURIER PHASE7 MONITOR INSUFFICIENT SAMPLE', [
                'window_start' => $metrics['window_start'] ?? null,
                'window_end' => $metrics['window_end'] ?? null,
                'total_shipments' => $metrics['total_shipments'] ?? null,
                'minimum_sample_size' => $thresholds['minimum_sample_size'] ?? null,
            ]);
        } else {
            $this->newLine();
            $this->info('Canary metrics are within thresholds. Continue rollout monitoring.');

            Log::info('COURIER PHASE7 MONITOR PASS', [
                'window_start' => $metrics['window_start'] ?? null,
                'window_end' => $metrics['window_end'] ?? null,
                'conversion_rate_percent' => $metrics['conversion_rate_percent'] ?? null,
                'error_rate_percent' => $metrics['error_rate_percent'] ?? null,
                'support_signal_rate_percent' => $metrics['support_signal_rate_percent'] ?? null,
                'critical_alert_count' => $metrics['critical_alert_count'] ?? null,
            ]);
        }

        $actions = is_array($metrics['stabilization_actions'] ?? null) ? $metrics['stabilization_actions'] : [];
        if (count($actions) > 0) {
            $this->newLine();
            $this->line('Recommended actions:');
            foreach ($actions as $action) {
                $this->line('- ' . (string) $action);
            }
        }

        if ($this->option('publish-summary')) {
            $summaryPath = trim((string) $this->option('summary-path'));
            $publishedPath = $monitoringService->publishPostImplementationSummary(
                $metrics,
                $summaryPath !== '' ? $summaryPath : null
            );

            $this->newLine();
            $this->info('Post-implementation summary updated: ' . $publishedPath);
        }

        return self::SUCCESS;
    }
}