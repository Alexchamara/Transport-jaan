<?php

namespace Tests\Unit\Courier;

use App\Services\Courier\CourierNotificationPreferenceService;
use Tests\TestCase;

class CourierNotificationPreferenceServiceTest extends TestCase
{
    public function test_normalize_upgrades_legacy_flags_to_v2_matrix(): void
    {
        $service = app(CourierNotificationPreferenceService::class);

        $normalized = $service->normalize([
            'notifyClientOutForDelivery' => false,
            'notifyInternalException' => false,
        ]);

        $this->assertSame(2, (int) ($normalized['version'] ?? 0));
        $this->assertFalse((bool) ($normalized['eventMatrix']['tracking_out_for_delivery']['client']['email'] ?? true));
        $this->assertFalse((bool) ($normalized['eventMatrix']['internal_exception']['internal']['email'] ?? true));
        $this->assertFalse((bool) ($normalized['notifyClientOutForDelivery'] ?? true));
        $this->assertFalse((bool) ($normalized['notifyInternalException'] ?? true));
    }

    public function test_to_legacy_flags_derives_email_toggles_from_matrix(): void
    {
        $service = app(CourierNotificationPreferenceService::class);
        $settings = $service->defaultSettings();
        $settings['eventMatrix']['payment_failed']['client']['email'] = false;
        $settings['eventMatrix']['internal_sla_risk']['internal']['email'] = false;

        $legacy = $service->toLegacyFlags($settings);

        $this->assertFalse((bool) ($legacy['notifyClientPaymentFailed'] ?? true));
        $this->assertFalse((bool) ($legacy['notifyInternalSlaRisk'] ?? true));
    }
}

