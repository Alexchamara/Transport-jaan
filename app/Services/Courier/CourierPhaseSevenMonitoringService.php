<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierShipment;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class CourierPhaseSevenMonitoringService
{
    private const LOG_SIGNAL_MAP = [
        'store_failures' => 'COURIER CLIENT STORE FAILURE',
        'pricing_exceptions' => 'COURIER CLIENT PRICING EXCEPTION',
        'ownership_failures' => 'COURIER CLIENT OWNERSHIP FAILURE',
        'authorization_denials' => 'COURIER CLIENT AUTHORIZATION DENIED',
        'repeated_authorization_denials' => 'COURIER CLIENT REPEATED AUTHORIZATION DENIALS',
    ];

    public function releaseChecklist(): array
    {
        $defaults = [
            'Confirm release owner, canary window timings, and rollback approver.',
            'Enable canary traffic for client courier bookings in a controlled window.',
            'Run courier:phase7-monitor hourly during canary and review fallback signals.',
            'Hold deployment if fallback criteria are breached and open stabilization patch ticket.',
            'Publish final post-implementation summary after canary closes cleanly.',
        ];

        $configured = config('courier.phase7.release_checklist', $defaults);
        if (!is_array($configured)) {
            return $defaults;
        }

        $checklist = array_values(array_filter(array_map(function ($item) {
            return is_string($item) && trim($item) !== '' ? trim($item) : null;
        }, $configured)));

        return count($checklist) > 0 ? $checklist : $defaults;
    }

    public function thresholds(): array
    {
        $defaults = [
            'min_conversion_rate_percent' => 85.0,
            'max_error_rate_percent' => 8.0,
            'max_support_signal_rate_percent' => 12.0,
            'max_critical_alerts' => 2,
            'minimum_sample_size' => 5,
        ];

        $configured = config('courier.phase7.thresholds', []);
        if (!is_array($configured)) {
            $configured = [];
        }

        return [
            'min_conversion_rate_percent' => (float) ($configured['min_conversion_rate_percent'] ?? $defaults['min_conversion_rate_percent']),
            'max_error_rate_percent' => (float) ($configured['max_error_rate_percent'] ?? $defaults['max_error_rate_percent']),
            'max_support_signal_rate_percent' => (float) ($configured['max_support_signal_rate_percent'] ?? $defaults['max_support_signal_rate_percent']),
            'max_critical_alerts' => (int) ($configured['max_critical_alerts'] ?? $defaults['max_critical_alerts']),
            'minimum_sample_size' => (int) ($configured['minimum_sample_size'] ?? $defaults['minimum_sample_size']),
        ];
    }

    public function canaryWindowHours(): int
    {
        return max(1, (int) config('courier.phase7.canary_window_hours', 24));
    }

    public function collectMetrics(CarbonInterface $windowStart, ?CarbonInterface $windowEnd = null, ?string $logFilePath = null): array
    {
        [$start, $end] = $this->normalizeWindow($windowStart, $windowEnd);

        $shipmentCounts = $this->shipmentCounts($start, $end);
        $signalCounts = $this->parseSignalsFromLog($logFilePath ?: $this->defaultLogPath(), $start, $end);

        $errorSignalCount = (int) $signalCounts['store_failures'] + (int) $signalCounts['pricing_exceptions'];
        $supportSignalCount = (int) $signalCounts['ownership_failures']
            + (int) $signalCounts['authorization_denials']
            + (int) $signalCounts['repeated_authorization_denials'];

        $windowMetrics = $this->buildWindowMetricsFromCounts(
            (int) $shipmentCounts['total_shipments'],
            (int) $shipmentCounts['converted_shipments'],
            $errorSignalCount,
            $supportSignalCount,
            (int) $signalCounts['repeated_authorization_denials']
        );

        return array_merge($windowMetrics, [
            'window_start' => $start->toDateTimeString(),
            'window_end' => $end->toDateTimeString(),
            'canary_window_hours' => $this->canaryWindowHours(),
            'shipment_counts' => $shipmentCounts,
            'signal_counts' => $signalCounts,
        ]);
    }

    public function buildWindowMetricsFromCounts(
        int $totalShipments,
        int $convertedShipments,
        int $errorSignalCount,
        int $supportSignalCount,
        int $criticalAlertCount
    ): array {
        $totalShipments = max(0, $totalShipments);
        $convertedShipments = max(0, min($convertedShipments, $totalShipments));

        $conversionRatePercent = $totalShipments > 0
            ? round(($convertedShipments / $totalShipments) * 100, 2)
            : 0.0;

        $errorRatePercent = $totalShipments > 0
            ? round(($errorSignalCount / $totalShipments) * 100, 2)
            : 0.0;

        $supportSignalRatePercent = $totalShipments > 0
            ? round(($supportSignalCount / $totalShipments) * 100, 2)
            : 0.0;

        $thresholdStatus = $this->evaluateThresholds(
            $conversionRatePercent,
            $errorRatePercent,
            $supportSignalRatePercent,
            max(0, $criticalAlertCount),
            $totalShipments
        );

        return [
            'total_shipments' => $totalShipments,
            'converted_shipments' => $convertedShipments,
            'error_signal_count' => max(0, $errorSignalCount),
            'support_signal_count' => max(0, $supportSignalCount),
            'critical_alert_count' => max(0, $criticalAlertCount),
            'conversion_rate_percent' => $conversionRatePercent,
            'error_rate_percent' => $errorRatePercent,
            'support_signal_rate_percent' => $supportSignalRatePercent,
            'threshold_status' => $thresholdStatus,
            'stabilization_actions' => $this->recommendedStabilizationActions($thresholdStatus['breaches']),
        ];
    }

    public function evaluateThresholds(
        float $conversionRatePercent,
        float $errorRatePercent,
        float $supportSignalRatePercent,
        int $criticalAlertCount,
        ?int $totalShipments = null
    ): array {
        $thresholds = $this->thresholds();
        $breaches = [];
        $minimumSampleSize = max(1, (int) ($thresholds['minimum_sample_size'] ?? 5));
        $insufficientData = $totalShipments !== null && $totalShipments < $minimumSampleSize;

        if (!$insufficientData && $conversionRatePercent < $thresholds['min_conversion_rate_percent']) {
            $breaches[] = [
                'code' => 'conversion_rate_below_minimum',
                'message' => 'Conversion rate dropped below rollout threshold.',
                'actual' => $conversionRatePercent,
                'threshold' => $thresholds['min_conversion_rate_percent'],
            ];
        }

        if (!$insufficientData && $errorRatePercent > $thresholds['max_error_rate_percent']) {
            $breaches[] = [
                'code' => 'error_rate_above_maximum',
                'message' => 'Error signal rate exceeded rollout threshold.',
                'actual' => $errorRatePercent,
                'threshold' => $thresholds['max_error_rate_percent'],
            ];
        }

        if (!$insufficientData && $supportSignalRatePercent > $thresholds['max_support_signal_rate_percent']) {
            $breaches[] = [
                'code' => 'support_signal_rate_above_maximum',
                'message' => 'Support signal proxy rate exceeded rollout threshold.',
                'actual' => $supportSignalRatePercent,
                'threshold' => $thresholds['max_support_signal_rate_percent'],
            ];
        }

        if ($criticalAlertCount > $thresholds['max_critical_alerts']) {
            $breaches[] = [
                'code' => 'critical_alert_count_above_maximum',
                'message' => 'Critical authorization-denial alerts exceeded threshold.',
                'actual' => max(0, $criticalAlertCount),
                'threshold' => $thresholds['max_critical_alerts'],
            ];
        }

        return [
            'canary_passed' => count($breaches) === 0,
            'fallback_required' => count($breaches) > 0,
            'insufficient_data' => $insufficientData,
            'thresholds' => $thresholds,
            'breaches' => $breaches,
        ];
    }

    public function parseSignalsFromLog(string $logFilePath, CarbonInterface $windowStart, ?CarbonInterface $windowEnd = null): array
    {
        [$start, $end] = $this->normalizeWindow($windowStart, $windowEnd);

        $counts = [];
        foreach (array_keys(self::LOG_SIGNAL_MAP) as $metricKey) {
            $counts[$metricKey] = 0;
        }

        $counts['log_file_path'] = $logFilePath;
        $counts['log_file_found'] = File::exists($logFilePath);

        if (!$counts['log_file_found']) {
            return $counts;
        }

        try {
            $reader = new \SplFileObject($logFilePath, 'r');

            while (!$reader->eof()) {
                $line = trim((string) $reader->fgets());
                if ($line === '') {
                    continue;
                }

                $timestamp = $this->parseLogTimestamp($line);
                if ($timestamp === null || $timestamp->lt($start) || $timestamp->gt($end)) {
                    continue;
                }

                foreach (self::LOG_SIGNAL_MAP as $metricKey => $needle) {
                    if (str_contains($line, $needle)) {
                        $counts[$metricKey]++;
                    }
                }
            }
        } catch (\Throwable $exception) {
            Log::warning('COURIER PHASE7 LOG PARSE FAILED', [
                'path' => $logFilePath,
                'message' => $exception->getMessage(),
            ]);
        }

        return $counts;
    }

    public function publishPostImplementationSummary(array $metrics, ?string $summaryPath = null): string
    {
        $targetPath = $summaryPath ?: (string) config('courier.phase7.post_implementation_summary_path', 'docs/Client/Services/Courier/Phases/COURIER_PHASE_7_POST_IMPLEMENTATION_SUMMARY.md');
        $absolutePath = $this->toAbsolutePath($targetPath);
        $directory = dirname($absolutePath);

        if (!File::isDirectory($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        if (!File::exists($absolutePath)) {
            File::put($absolutePath, "# Courier Phase 7 - Post-Implementation Summary\n\n");
        }

        $thresholdStatus = is_array($metrics['threshold_status'] ?? null) ? $metrics['threshold_status'] : [];
        $breaches = is_array($thresholdStatus['breaches'] ?? null) ? $thresholdStatus['breaches'] : [];

        $lines = [
            '## Monitoring Snapshot - ' . now()->format('Y-m-d H:i:s'),
            '',
            '- Window: ' . (string) ($metrics['window_start'] ?? 'n/a') . ' -> ' . (string) ($metrics['window_end'] ?? 'n/a'),
            '- Total shipments: ' . (int) ($metrics['total_shipments'] ?? 0),
            '- Converted shipments: ' . (int) ($metrics['converted_shipments'] ?? 0),
            '- Conversion rate: ' . number_format((float) ($metrics['conversion_rate_percent'] ?? 0), 2) . '%',
            '- Error signal rate: ' . number_format((float) ($metrics['error_rate_percent'] ?? 0), 2) . '%',
            '- Support signal proxy rate: ' . number_format((float) ($metrics['support_signal_rate_percent'] ?? 0), 2) . '%',
            '- Critical alerts: ' . (int) ($metrics['critical_alert_count'] ?? 0),
            '',
        ];

        if (count($breaches) === 0) {
            $lines[] = '- Result: Canary pass. Continue controlled monitoring until rollout completion.';
        } else {
            $lines[] = '- Result: Fallback advised. Breaches detected:';

            foreach ($breaches as $breach) {
                $code = (string) ($breach['code'] ?? 'unknown');
                $actual = (string) ($breach['actual'] ?? 'n/a');
                $threshold = (string) ($breach['threshold'] ?? 'n/a');
                $lines[] = '  - ' . $code . ' (actual=' . $actual . ', threshold=' . $threshold . ')';
            }
        }

        $actions = is_array($metrics['stabilization_actions'] ?? null) ? $metrics['stabilization_actions'] : [];
        if (count($actions) > 0) {
            $lines[] = '';
            $lines[] = '- Stabilization actions:';

            foreach ($actions as $action) {
                $lines[] = '  - ' . (string) $action;
            }
        }

        $lines[] = '';

        $existingContent = (string) File::get($absolutePath);
        $prefix = $existingContent !== '' && !str_ends_with($existingContent, PHP_EOL)
            ? PHP_EOL
            : '';

        File::append($absolutePath, $prefix . implode(PHP_EOL, $lines) . PHP_EOL);

        return $this->toRelativePath($absolutePath);
    }

    private function shipmentCounts(CarbonImmutable $windowStart, CarbonImmutable $windowEnd): array
    {
        try {
            $baseQuery = CourierShipment::query()
                ->whereBetween('created_at', [$windowStart->toDateTimeString(), $windowEnd->toDateTimeString()]);

            $totalShipments = (clone $baseQuery)->count();
            $convertedShipments = (clone $baseQuery)
                ->whereIn('status', [
                    CourierShipment::STATUS_CONFIRMED,
                    CourierShipment::STATUS_IN_TRANSIT,
                    CourierShipment::STATUS_DELIVERED,
                ])
                ->count();

            $cancelledShipments = (clone $baseQuery)
                ->where('status', CourierShipment::STATUS_CANCELLED)
                ->count();

            return [
                'total_shipments' => (int) $totalShipments,
                'converted_shipments' => (int) $convertedShipments,
                'cancelled_shipments' => (int) $cancelledShipments,
                'data_source' => 'database',
            ];
        } catch (\Throwable $exception) {
            Log::warning('COURIER PHASE7 SHIPMENT QUERY FAILED', [
                'message' => $exception->getMessage(),
            ]);

            return [
                'total_shipments' => 0,
                'converted_shipments' => 0,
                'cancelled_shipments' => 0,
                'data_source' => 'fallback_zero',
            ];
        }
    }

    private function normalizeWindow(CarbonInterface $windowStart, ?CarbonInterface $windowEnd = null): array
    {
        $timezone = (string) config('app.timezone', 'UTC');

        $start = CarbonImmutable::instance($windowStart)->setTimezone($timezone);
        $end = $windowEnd
            ? CarbonImmutable::instance($windowEnd)->setTimezone($timezone)
            : CarbonImmutable::now($timezone);

        if ($end->lt($start)) {
            return [$end, $start];
        }

        return [$start, $end];
    }

    private function parseLogTimestamp(string $line): ?CarbonImmutable
    {
        if (!preg_match('/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/', $line, $matches)) {
            return null;
        }

        try {
            $timezone = (string) config('app.timezone', 'UTC');
            $timestamp = CarbonImmutable::createFromFormat('Y-m-d H:i:s', $matches[1], $timezone);

            return $timestamp === false ? null : $timestamp;
        } catch (\Throwable) {
            return null;
        }
    }

    private function defaultLogPath(): string
    {
        return storage_path('logs/laravel.log');
    }

    private function recommendedStabilizationActions(array $breaches): array
    {
        if (count($breaches) === 0) {
            return [
                'No fallback criteria breached. Continue canary monitoring and close rollout window as planned.',
            ];
        }

        $actions = [];

        foreach ($breaches as $breach) {
            $code = (string) ($breach['code'] ?? '');

            if ($code === 'conversion_rate_below_minimum') {
                $actions[] = 'Review checkout/drop-off funnel traces and patch failed summary/store transitions.';
            }

            if ($code === 'error_rate_above_maximum') {
                $actions[] = 'Inspect COURIER CLIENT STORE FAILURE and COURIER CLIENT PRICING EXCEPTION events, then hotfix top offenders.';
            }

            if ($code === 'support_signal_rate_above_maximum') {
                $actions[] = 'Correlate ownership/authorization denials with user reports and patch unclear ownership UX or policy edges.';
            }

            if ($code === 'critical_alert_count_above_maximum') {
                $actions[] = 'Trigger fallback protocol and keep canary percentage frozen until repeated denial spikes stabilize.';
            }
        }

        return array_values(array_unique($actions));
    }

    private function toAbsolutePath(string $path): string
    {
        if ($path === '') {
            return base_path('docs/Client/Services/Courier/Phases/COURIER_PHASE_7_POST_IMPLEMENTATION_SUMMARY.md');
        }

        if (str_starts_with($path, DIRECTORY_SEPARATOR)) {
            return $path;
        }

        return base_path($path);
    }

    private function toRelativePath(string $path): string
    {
        $basePath = base_path();
        $normalizedBase = rtrim($basePath, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;

        if (str_starts_with($path, $normalizedBase)) {
            return substr($path, strlen($normalizedBase));
        }

        return $path;
    }
}