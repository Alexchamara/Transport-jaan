<?php

return [
    'phase7' => [
        'canary_window_hours' => (int) env('COURIER_PHASE7_CANARY_WINDOW_HOURS', 24),
        'thresholds' => [
            'min_conversion_rate_percent' => (float) env('COURIER_PHASE7_MIN_CONVERSION_RATE_PERCENT', 85.0),
            'max_error_rate_percent' => (float) env('COURIER_PHASE7_MAX_ERROR_RATE_PERCENT', 8.0),
            'max_support_signal_rate_percent' => (float) env('COURIER_PHASE7_MAX_SUPPORT_SIGNAL_RATE_PERCENT', 12.0),
            'max_critical_alerts' => (int) env('COURIER_PHASE7_MAX_CRITICAL_ALERTS', 2),
            'minimum_sample_size' => (int) env('COURIER_PHASE7_MINIMUM_SAMPLE_SIZE', 5),
        ],
        'release_checklist' => [
            'Confirm release owner, canary window timings, and rollback approver.',
            'Enable canary traffic for client courier bookings in a controlled window.',
            'Run courier:phase7-monitor hourly during canary and review fallback signals.',
            'Hold deployment if fallback criteria are breached and open stabilization patch ticket.',
            'Publish final post-implementation summary after canary closes cleanly.',
        ],
        'post_implementation_summary_path' => 'docs/Client/Services/Courier/Phases/COURIER_PHASE_7_POST_IMPLEMENTATION_SUMMARY.md',
    ],
];