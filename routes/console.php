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
