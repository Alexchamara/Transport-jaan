<?php

namespace Tests\Feature\Courier;

use App\Models\Courier\CourierShipment;
use App\Models\Courier\VendorCourierSetting;
use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;
use App\Models\User;
use App\Models\VendorServiceRegistration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourierAdvancedPricingPoliciesTest extends TestCase
{
    use RefreshDatabase;

    public function test_remote_area_surcharge_is_applied(): void
    {
        $this->createDomesticVendorWithPolicyModules([
            'remoteAreaSurcharge' => [
                'enabled' => true,
                'flatFee' => 12,
                'applyOnOrigin' => false,
                'applyOnDestination' => true,
                'postalCodePrefixes' => ['200'],
                'cityKeywords' => [],
            ],
        ]);

        $result = $this->submitShipment([
            'recipient' => [
                'address' => [
                    'postalCode' => '20055',
                ],
            ],
        ]);

        $this->assertEqualsWithDelta(62.0, $result['estimatedCost'], 0.01);
        $this->assertPolicyAdjustmentExists($result['pricingExplanation'], 'remote_area_surcharge', 12.0);
    }

    public function test_oversize_and_overweight_adjustments_are_applied(): void
    {
        $this->createDomesticVendorWithPolicyModules([
            'oversizeOverweightRules' => [
                'enabled' => true,
                'maxWeightKg' => 10,
                'overweightPerKgFee' => 2,
                'maxLengthCm' => 100,
                'maxWidthCm' => 80,
                'maxHeightCm' => 80,
                'oversizeFlatFee' => 7,
            ],
        ]);

        $result = $this->submitShipment([
            'packages' => [
                [
                    'weightKg' => 13,
                    'lengthCm' => 110,
                    'widthCm' => 40,
                    'heightCm' => 30,
                    'quantity' => 2,
                ],
            ],
        ]);

        $this->assertEqualsWithDelta(76.0, $result['estimatedCost'], 0.01);
        $this->assertPolicyAdjustmentExists($result['pricingExplanation'], 'overweight_surcharge', 12.0);
        $this->assertPolicyAdjustmentExists($result['pricingExplanation'], 'oversize_surcharge', 14.0);
    }

    public function test_peak_and_holiday_surcharges_are_applied_together(): void
    {
        $this->createDomesticVendorWithPolicyModules([
            'peakHolidaySurcharge' => [
                'enabled' => true,
                'peakStartTime' => '17:00',
                'peakEndTime' => '21:00',
                'daysOfWeek' => [1, 2, 3, 4, 5, 6, 7],
                'peakPercent' => 20,
                'peakFlatFee' => 3,
                'holidayDates' => ['2026-03-23'],
                'holidayPercent' => 10,
                'holidayFlatFee' => 5,
            ],
        ]);

        $result = $this->submitShipment([
            'shipment' => [
                'pickupDate' => '2026-03-23',
                'pickupWindowStart' => '18:30',
            ],
            'reviewContext' => [
                'selectedQuotes' => [
                    [
                        'priceUSD' => 100,
                    ],
                ],
            ],
        ]);

        $this->assertEqualsWithDelta(141.0, $result['estimatedCost'], 0.01);
        $this->assertPolicyAdjustmentExists($result['pricingExplanation'], 'holiday_surcharge', 15.0);
        $this->assertPolicyAdjustmentExists($result['pricingExplanation'], 'peak_hour_surcharge', 26.0);
    }

    public function test_cod_fee_respects_maximum_cap(): void
    {
        $this->createDomesticVendorWithPolicyModules([
            'codFee' => [
                'enabled' => true,
                'flatFee' => 2,
                'percentOfDeclaredValue' => 5,
                'minFee' => 10,
                'maxFee' => 20,
            ],
        ]);

        $result = $this->submitShipment([
            'shipment' => [
                'estimatedValue' => 400,
            ],
        ]);

        $this->assertEqualsWithDelta(70.0, $result['estimatedCost'], 0.01);
        $this->assertPolicyAdjustmentExists($result['pricingExplanation'], 'cod_fee', 20.0);
    }

    public function test_minimum_shipment_guardrail_sets_floor_total(): void
    {
        $this->createDomesticVendorWithPolicyModules([
            'minimumShipmentCharge' => [
                'enabled' => true,
                'minimumTotal' => 80,
            ],
        ]);

        $result = $this->submitShipment();

        $this->assertEqualsWithDelta(80.0, $result['estimatedCost'], 0.01);
        $this->assertPolicyAdjustmentExists($result['pricingExplanation'], 'minimum_shipment_guardrail', 30.0);
    }

    private function createDomesticVendorWithPolicyModules(array $policyModules): User
    {
        $vendor = User::factory()->create([
            'role' => 'vendor',
            'status' => 'verified',
        ]);

        $category = ServiceCategory::query()->create([
            'name' => 'Courier Services',
            'slug' => 'courier-services',
            'description' => 'Courier service category for tests',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $subCategory = ServiceSubCategory::query()->create([
            'service_category_id' => $category->id,
            'name' => 'Courier Domestic',
            'slug' => 'domestic',
            'description' => 'Courier domestic category for tests',
            'required_fields' => [],
            'display_order' => 1,
            'is_active' => true,
        ]);

        VendorServiceRegistration::query()->create([
            'user_id' => $vendor->id,
            'service_category_id' => $category->id,
            'service_sub_category_id' => $subCategory->id,
            'field_values' => [],
            'status' => 'approved',
            'submitted_at' => now(),
            'reviewed_at' => now(),
        ]);

        VendorCourierSetting::query()->updateOrCreate(
            ['vendor_user_id' => $vendor->id],
            [
                'settings' => [
                    'pricing' => [
                        'serviceCatalog' => [
                            'domestic' => [
                                [
                                    'key' => 'next_day',
                                    'label' => 'Next Day',
                                    'promisedSlaDays' => 1,
                                    'cutoffTime' => '23:59',
                                    'isActive' => true,
                                ],
                            ],
                        ],
                        'localization' => [
                            'domestic' => [
                                'baseCurrency' => 'USD',
                                'manualRates' => [
                                    'USD' => 1,
                                ],
                            ],
                        ],
                        'laneMatrix' => [
                            'enabled' => [
                                'domestic' => false,
                            ],
                            'domestic' => [],
                        ],
                        'policyModules' => [
                            'domestic' => $policyModules,
                        ],
                    ],
                ],
            ]
        );

        return $vendor;
    }

    private function submitShipment(array $overrides = []): array
    {
        $user = User::factory()->create();

        $payload = $this->buildPayload($overrides);
        $csrfToken = 'advanced-policy-test-token';

        $response = $this->actingAs($user)
            ->withSession(['_token' => $csrfToken])
            ->post(route('couriers.store'), $payload + ['_token' => $csrfToken]);

        $response->assertRedirect(route('couriers.create'));
        $response->assertSessionHas('success');
        $response->assertSessionHas('courier_pricing_explanation');

        $shipment = CourierShipment::query()->latest('id')->first();
        $this->assertNotNull($shipment);

        $pricingExplanation = $response->baseResponse->getSession()->get('courier_pricing_explanation');
        $this->assertIsArray($pricingExplanation);

        return [
            'estimatedCost' => (float) ($shipment->estimated_cost ?? 0),
            'pricingExplanation' => $pricingExplanation,
        ];
    }

    private function buildPayload(array $overrides = []): array
    {
        $base = [
            'sender' => [
                'name' => 'Sender',
                'address' => [
                    'line1' => '123 Main Street',
                    'city' => 'Colombo',
                    'state' => 'Western',
                    'postalCode' => '10000',
                    'country' => 'LK',
                ],
            ],
            'recipient' => [
                'name' => 'Recipient',
                'address' => [
                    'line1' => '456 Hill Road',
                    'city' => 'Kandy',
                    'state' => 'Central',
                    'postalCode' => '20000',
                    'country' => 'LK',
                ],
            ],
            'shipment' => [
                'pickupDate' => now()->addDay()->toDateString(),
                'pickupWindowStart' => '09:00',
                'pickupWindowEnd' => '12:00',
                'serviceLevel' => 'Next Day',
                'currency' => 'USD',
                'insurance' => false,
                'estimatedValue' => 100,
            ],
            'packages' => [
                [
                    'label' => 'Box 1',
                    'packageType' => 'parcel',
                    'courierProvider' => 'dhl',
                    'serviceLevel' => 'next_day',
                    'quantity' => 1,
                    'weightKg' => 5,
                    'lengthCm' => 30,
                    'widthCm' => 20,
                    'heightCm' => 15,
                    'declaredValue' => 100,
                ],
            ],
            'reviewContext' => [
                'displayCurrency' => 'USD',
                'totalPriceUSD' => 50,
                'selectedQuotes' => [
                    [
                        'packageIndex' => 0,
                        'providerId' => 'dhl',
                        'providerName' => 'DHL Express',
                        'serviceLevel' => 'next_day',
                        'serviceLabel' => 'Next Day',
                        'priceUSD' => 50,
                    ],
                ],
            ],
        ];

        return array_replace_recursive($base, $overrides);
    }

    private function assertPolicyAdjustmentExists(array $pricingExplanation, string $key, float $expectedAmount): void
    {
        $adjustment = collect($pricingExplanation['policyAdjustments'] ?? [])
            ->first(fn ($item) => is_array($item) && ($item['key'] ?? null) === $key);

        $this->assertNotNull($adjustment, sprintf('Policy adjustment "%s" was not found.', $key));
        $this->assertEqualsWithDelta($expectedAmount, (float) ($adjustment['amount'] ?? 0), 0.01);
    }
}
