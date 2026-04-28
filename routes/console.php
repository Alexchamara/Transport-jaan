<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule booking expiry job
Schedule::command('bookings:expire')
    ->everyMinute()
    ->withoutOverlapping()
    ->runInBackground();

// Suspend drivers whose driving license has expired (runs daily at 00:05)
Schedule::command('drivers:check-license-expiry')
    ->dailyAt('00:05')
    ->withoutOverlapping()
    ->runInBackground();

// Refresh courier pricing exchange rates daily for vendors who enable live-rate strategy.
Schedule::command('courier:refresh-exchange-rates')
    ->dailyAt('00:20')
    ->withoutOverlapping()
    ->runInBackground();

// Publish scheduled pricing snapshots once effective time is reached.
Schedule::command('courier:publish-scheduled-pricing')
    ->everyTenMinutes()
    ->withoutOverlapping()
    ->runInBackground();

// Monitor courier Phase 7 rollout health and evaluate fallback criteria.
Schedule::command('courier:phase7-monitor --hours=24')
    ->hourly()
    ->withoutOverlapping()
    ->runInBackground();

// Monitor COD audit-chain integrity and auto-open incidents for compromised capabilities.
Schedule::command('courier:cod-integrity-monitor --auto-open')
    ->everyThirtyMinutes()
    ->withoutOverlapping()
    ->runInBackground();

// Archive COD compliance package daily for operational and audit retention.
Schedule::command('courier:cod-compliance-archive')
    ->dailyAt('00:45')
    ->when(static fn () => (bool) config('courier.cod_compliance_export.archive.enabled', true))
    ->withoutOverlapping()
    ->runInBackground();

// Retry failed courier client lifecycle email dispatches.
Schedule::command('courier:customer-email-retry --limit=150')
    ->everyTenMinutes()
    ->withoutOverlapping()
    ->runInBackground();
