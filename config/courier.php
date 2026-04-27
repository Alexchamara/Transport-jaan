<?php

return [
    'payments' => [
        'enabled' => (bool) env('COURIER_PAYMENTS_ENABLED', true),
        'gateway' => (string) env('COURIER_PAYMENTS_GATEWAY', 'payhere'),
        'provider' => [
            'payhere' => [
                'enabled' => (bool) env('COURIER_PAYHERE_ENABLED', true),
                'domestic_currency' => strtoupper((string) env('COURIER_PAYHERE_DOMESTIC_CURRENCY', 'LKR')),
                'international_fallback_currency' => strtoupper((string) env('COURIER_PAYHERE_INTERNATIONAL_FALLBACK_CURRENCY', 'USD')),
                'supported_international_currencies' => array_values(array_filter(array_map(
                    static fn ($currency) => strtoupper(trim((string) $currency)),
                    explode(',', (string) env('COURIER_PAYHERE_SUPPORTED_INTERNATIONAL_CURRENCIES', 'USD'))
                ))),
                'pending_expiry_minutes' => (int) env('COURIER_PAYHERE_PENDING_EXPIRY_MINUTES', 60),
            ],
        ],
    ],

    'cod_compliance_export' => [
        'archive' => [
            'enabled' => (bool) env('COURIER_COD_COMPLIANCE_ARCHIVE_ENABLED', true),
            'disk' => (string) env('COURIER_COD_COMPLIANCE_ARCHIVE_DISK', env('FILESYSTEM_DISK', 'local')),
            'path' => (string) env('COURIER_COD_COMPLIANCE_ARCHIVE_PATH', 'courier/cod-compliance'),
            'retention_days' => (int) env('COURIER_COD_COMPLIANCE_ARCHIVE_RETENTION_DAYS', 90),
        ],
    ],

    'cod_integrity' => [
        'monitor' => [
            'scan_chunk_size' => (int) env('COURIER_COD_INTEGRITY_MONITOR_CHUNK_SIZE', 100),
        ],
        'alerts' => [
            'enabled' => (bool) env('COURIER_COD_INTEGRITY_ALERTS_ENABLED', true),
            'dedupe_window_minutes' => (int) env('COURIER_COD_INTEGRITY_ALERT_DEDUPE_MINUTES', 30),
            'emails_csv' => (string) env('COURIER_COD_INTEGRITY_ALERT_EMAILS', ''),
            'webhook_url' => (string) env('COURIER_COD_INTEGRITY_ALERT_WEBHOOK_URL', ''),
        ],
    ],

    'superadmin_rbac' => [
        // Transitional mode for Phase 1 rollout: SuperAdmin users without explicit
        // superadmin.courier.* grants keep existing access until assignments are configured.
        'bootstrap_allow_all' => (bool) env('COURIER_SUPERADMIN_RBAC_BOOTSTRAP_ALLOW_ALL', true),
        'permission_prefix' => (string) env('COURIER_SUPERADMIN_RBAC_PERMISSION_PREFIX', 'superadmin.courier.'),
        'service_key' => (string) env('COURIER_SUPERADMIN_RBAC_SERVICE_KEY', 'superadmin_courier_access'),
        'workspace_name' => (string) env('COURIER_SUPERADMIN_RBAC_WORKSPACE_NAME', 'SuperAdmin Courier Access'),
    ],

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