<?php

namespace Tests\Unit\Courier;

use App\Services\Courier\CourierPhaseSevenMonitoringService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class CourierPhaseSevenMonitoringServiceTest extends TestCase
{
    public function test_evaluate_thresholds_passes_when_metrics_are_within_limits(): void
    {
        config()->set('courier.phase7.thresholds', [
            'min_conversion_rate_percent' => 80.0,
            'max_error_rate_percent' => 6.0,
            'max_support_signal_rate_percent' => 10.0,
            'max_critical_alerts' => 2,
            'minimum_sample_size' => 5,
        ]);

        $service = new CourierPhaseSevenMonitoringService();
        $status = $service->evaluateThresholds(88.5, 2.0, 4.5, 1);

        $this->assertTrue($status['canary_passed']);
        $this->assertFalse($status['fallback_required']);
        $this->assertCount(0, $status['breaches']);
    }

    public function test_evaluate_thresholds_reports_all_breaches(): void
    {
        config()->set('courier.phase7.thresholds', [
            'min_conversion_rate_percent' => 85.0,
            'max_error_rate_percent' => 5.0,
            'max_support_signal_rate_percent' => 8.0,
            'max_critical_alerts' => 1,
            'minimum_sample_size' => 5,
        ]);

        $service = new CourierPhaseSevenMonitoringService();
        $status = $service->evaluateThresholds(70.0, 9.0, 12.0, 3);

        $codes = array_column($status['breaches'], 'code');

        $this->assertFalse($status['canary_passed']);
        $this->assertTrue($status['fallback_required']);
        $this->assertContains('conversion_rate_below_minimum', $codes);
        $this->assertContains('error_rate_above_maximum', $codes);
        $this->assertContains('support_signal_rate_above_maximum', $codes);
        $this->assertContains('critical_alert_count_above_maximum', $codes);
    }

    public function test_evaluate_thresholds_marks_insufficient_data_without_forcing_fallback(): void
    {
        config()->set('courier.phase7.thresholds', [
            'min_conversion_rate_percent' => 85.0,
            'max_error_rate_percent' => 5.0,
            'max_support_signal_rate_percent' => 8.0,
            'max_critical_alerts' => 1,
            'minimum_sample_size' => 10,
        ]);

        $service = new CourierPhaseSevenMonitoringService();
        $status = $service->evaluateThresholds(20.0, 12.0, 12.0, 0, 3);

        $this->assertTrue($status['canary_passed']);
        $this->assertFalse($status['fallback_required']);
        $this->assertTrue($status['insufficient_data']);
        $this->assertCount(0, $status['breaches']);
    }

    public function test_parse_signals_from_log_counts_only_events_in_window(): void
    {
        config()->set('app.timezone', 'UTC');

        $service = new CourierPhaseSevenMonitoringService();
        $logPath = storage_path('framework/testing/courier-phase7-monitor.log');

        if (!File::isDirectory(dirname($logPath))) {
            File::makeDirectory(dirname($logPath), 0755, true);
        }

        $lines = [
            '[2026-03-20 08:00:00] local.WARNING: COURIER CLIENT STORE FAILURE {"reason":"validation"}',
            '[2026-03-20 08:30:00] local.ERROR: COURIER CLIENT PRICING EXCEPTION {"phase":"preview"}',
            '[2026-03-20 09:00:00] local.WARNING: COURIER CLIENT OWNERSHIP FAILURE {"resource_id":11}',
            '[2026-03-20 09:05:00] local.WARNING: COURIER CLIENT AUTHORIZATION DENIED {"reason":"ownership_failure"}',
            '[2026-03-20 09:10:00] local.ERROR: COURIER CLIENT REPEATED AUTHORIZATION DENIALS {"attempt_count":5}',
            '[2026-03-21 00:00:01] local.ERROR: COURIER CLIENT PRICING EXCEPTION {"phase":"store"}',
        ];

        File::put($logPath, implode(PHP_EOL, $lines) . PHP_EOL);

        try {
            $windowStart = CarbonImmutable::parse('2026-03-20 00:00:00', 'UTC');
            $windowEnd = CarbonImmutable::parse('2026-03-20 23:59:59', 'UTC');

            $counts = $service->parseSignalsFromLog($logPath, $windowStart, $windowEnd);

            $this->assertTrue($counts['log_file_found']);
            $this->assertSame(1, $counts['store_failures']);
            $this->assertSame(1, $counts['pricing_exceptions']);
            $this->assertSame(1, $counts['ownership_failures']);
            $this->assertSame(1, $counts['authorization_denials']);
            $this->assertSame(1, $counts['repeated_authorization_denials']);
        } finally {
            if (File::exists($logPath)) {
                File::delete($logPath);
            }
        }
    }
}