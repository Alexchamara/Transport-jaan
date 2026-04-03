<?php

namespace Tests\Feature\Courier;

use App\Models\Courier\CourierVendorCodCapability;
use App\Models\Courier\CourierShipment;
use App\Models\Courier\VendorCourierSetting;
use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;
use App\Models\User;
use App\Models\VendorServiceRegistration;
use App\Services\Courier\CourierVendorAssignmentService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class CourierAdvancedPricingPoliciesTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow(Carbon::create(2026, 3, 30, 10, 0, 0, 'UTC'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

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
        $holidayDate = now()->addDay()->toDateString();

        $this->createDomesticVendorWithPolicyModules([
            'peakHolidaySurcharge' => [
                'enabled' => true,
                'peakStartTime' => '17:00',
                'peakEndTime' => '21:00',
                'daysOfWeek' => [1, 2, 3, 4, 5, 6, 7],
                'peakPercent' => 20,
                'peakFlatFee' => 3,
                'holidayDates' => [$holidayDate],
                'holidayPercent' => 10,
                'holidayFlatFee' => 5,
            ],
        ]);

        $result = $this->submitShipment([
            'shipment' => [
                'pickupDate' => $holidayDate,
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

    public function test_speed_eta_tier_engine_applies_multiplier(): void
    {
        $this->createDomesticVendorWithPolicyModules([
            'speedEtaTierEngine' => [
                'enabled' => true,
                'enforceFixedNamedTiers' => true,
                'enforceTierPricingMultiplier' => true,
                'tiers' => [
                    'next_day' => [
                        'enabled' => true,
                        'priceMultiplier' => 1.2,
                        'etaMinDays' => 1,
                        'etaMaxDays' => 2,
                    ],
                ],
            ],
        ]);

        $result = $this->submitShipment();

        $this->assertEqualsWithDelta(60.0, $result['estimatedCost'], 0.01);
        $this->assertPolicyAdjustmentExists($result['pricingExplanation'], 'speed_eta_tier_multiplier', 10.0);
        $this->assertSame('next_day', $result['pricingExplanation']['speedEtaTier']['tierKey'] ?? null);
        $this->assertNotNull($result['pricingExplanation']['speedEtaTier']['etaStartDate'] ?? null);
    }

    public function test_speed_eta_tier_engine_blocks_excess_weight(): void
    {
        $this->createDomesticVendorWithPolicyModules([
            'speedEtaTierEngine' => [
                'enabled' => true,
                'enforceFixedNamedTiers' => true,
                'tiers' => [
                    'next_day' => [
                        'enabled' => true,
                        'maxWeightKg' => 4,
                    ],
                ],
            ],
        ]);

        $user = User::factory()->create();
        $payload = $this->buildPayload();
        $csrfToken = 'advanced-policy-test-token-weight-block';

        $response = $this->actingAs($user)
            ->withSession(['_token' => $csrfToken, 'courier_preview' => $payload])
            ->post(route('couriers.store'), $payload + ['_token' => $csrfToken]);

        $response->assertSessionHasErrors('packages');
        $this->assertSame(0, CourierShipment::query()->where('requested_by_user_id', $user->id)->count());
    }

    public function test_logistic_dimensions_engine_applies_combined_multiplier(): void
    {
        $this->createLogisticVendorWithPolicyModules([
            'logisticDimensionsEngine' => [
                'enabled' => true,
                'enforceForLogisticOnly' => true,
                'unitTypeMultipliers' => [
                    'pallet' => 1.1,
                ],
                'routeClassMultipliers' => [
                    'express_corridor' => 1.2,
                ],
                'handlingClassMultipliers' => [
                    'fragile' => 1.05,
                ],
                'w2wOption' => [
                    'enabled' => true,
                    'strictForLogistic' => true,
                    'defaultMode' => 'door_to_door',
                    'minimumUnitCount' => 1,
                    'maximumUnitCount' => 5,
                    'modeMultipliers' => [
                        'door_to_door' => 1.15,
                    ],
                ],
            ],
        ]);

        $result = $this->submitShipment([
            'sender' => [
                'address' => [
                    'country' => 'US',
                ],
            ],
            'shipment' => [
                'logisticDimensions' => [
                    'unitType' => 'pallet',
                    'unitCount' => 2,
                    'routeClass' => 'express_corridor',
                    'handlingClass' => 'fragile',
                    'w2wMode' => 'door_to_door',
                ],
            ],
        ]);

        $this->assertEqualsWithDelta(79.7, $result['estimatedCost'], 0.01);
        $this->assertPolicyAdjustmentExists($result['pricingExplanation'], 'logistic_dimensions_engine', 29.7);
    }

    public function test_logistic_dimensions_engine_rejects_invalid_unit_type(): void
    {
        $this->createLogisticVendorWithPolicyModules([
            'logisticDimensionsEngine' => [
                'enabled' => true,
                'enforceForLogisticOnly' => true,
                'unitTypeMultipliers' => [
                    'pallet' => 1.1,
                ],
                'routeClassMultipliers' => [
                    'standard' => 1.0,
                ],
                'handlingClassMultipliers' => [
                    'standard' => 1.0,
                ],
                'w2wOption' => [
                    'enabled' => true,
                    'strictForLogistic' => true,
                    'defaultMode' => 'door_to_door',
                    'modeMultipliers' => [
                        'door_to_door' => 1.0,
                    ],
                ],
            ],
        ]);

        $user = User::factory()->create();
        $payload = $this->buildPayload([
            'sender' => [
                'address' => [
                    'country' => 'US',
                ],
            ],
            'shipment' => [
                'logisticDimensions' => [
                    'unitType' => 'unsupported_unit',
                    'unitCount' => 1,
                    'routeClass' => 'standard',
                    'handlingClass' => 'standard',
                    'w2wMode' => 'door_to_door',
                ],
            ],
        ]);
        $csrfToken = 'advanced-policy-test-token-logistic-unit-type';

        $response = $this->actingAs($user)
            ->withSession(['_token' => $csrfToken, 'courier_preview' => $payload])
            ->post(route('couriers.store'), $payload + ['_token' => $csrfToken]);

        $response->assertSessionHasErrors('shipment.logisticDimensions.unitType');
        $this->assertSame(0, CourierShipment::query()->where('requested_by_user_id', $user->id)->count());
    }

    public function test_quote_runtime_governance_field_lock_rejects_service_level_mismatch(): void
    {
        $this->createDomesticVendorWithPolicyModules([
            'quoteRuntimeGovernance' => [
                'enabled' => true,
                'fieldLocks' => [
                    'enabled' => true,
                    'lockShipmentServiceLevel' => true,
                    'lockPackageServiceLevel' => false,
                    'lockPackageCourierProvider' => false,
                    'lockQuoteTotal' => false,
                ],
            ],
        ]);

        $user = User::factory()->create();
        $payload = $this->buildPayload([
            'shipment' => [
                'serviceLevel' => 'Economy',
            ],
            'reviewContext' => [
                'selectedQuotes' => [
                    [
                        'serviceLevel' => 'next_day',
                        'serviceLabel' => 'Next Day',
                    ],
                ],
            ],
        ]);
        $csrfToken = 'advanced-policy-test-token-runtime-lock';

        $response = $this->actingAs($user)
            ->withSession(['_token' => $csrfToken, 'courier_preview' => $payload])
            ->post(route('couriers.store'), $payload + ['_token' => $csrfToken]);

        $response->assertSessionHasErrors('shipment.serviceLevel');
    }

    public function test_quote_runtime_discount_ceiling_and_floor_guardrails_are_enforced(): void
    {
        $this->createDomesticVendorWithPolicyModules([
            'quoteRuntimeGovernance' => [
                'enabled' => true,
                'discountGuardrails' => [
                    'enabled' => true,
                    'maxDiscountPercent' => 10,
                    'maxDiscountAmountUsd' => 2,
                ],
                'floorPriceGuardrail' => [
                    'enabled' => true,
                    'minimumTotalUsd' => 45,
                ],
            ],
        ]);

        $result = $this->submitShipment([
            'reviewContext' => [
                'discountPercent' => 50,
                'discountAmountUSD' => 10,
            ],
        ]);

        $this->assertEqualsWithDelta(45.0, $result['estimatedCost'], 0.01);
        $this->assertPolicyAdjustmentExists($result['pricingExplanation'], 'quote_runtime_discount_applied', -7.0);
        $this->assertPolicyAdjustmentExists($result['pricingExplanation'], 'quote_runtime_discount_ceiling_guardrail', 28.0);
        $this->assertPolicyAdjustmentExists($result['pricingExplanation'], 'quote_runtime_floor_price_guardrail', 2.0);
    }

    public function test_pricing_output_is_deterministic_for_same_payload_and_policies(): void
    {
        $this->createDomesticVendorWithPolicyModules([
            'remoteAreaSurcharge' => [
                'enabled' => true,
                'flatFee' => 10,
                'applyOnOrigin' => false,
                'applyOnDestination' => true,
                'postalCodePrefixes' => ['200'],
            ],
            'quoteRuntimeGovernance' => [
                'enabled' => true,
                'discountGuardrails' => [
                    'enabled' => true,
                    'maxDiscountPercent' => 10,
                    'maxDiscountAmountUsd' => 2,
                ],
            ],
        ]);

        $overrides = [
            'recipient' => [
                'address' => [
                    'postalCode' => '20011',
                ],
            ],
            'reviewContext' => [
                'discountPercent' => 30,
                'discountAmountUSD' => 5,
            ],
        ];

        $first = $this->submitShipment($overrides);
        $second = $this->submitShipment($overrides);

        $this->assertEqualsWithDelta($first['estimatedCost'], $second['estimatedCost'], 0.0001);
        $this->assertEquals(
            $this->pricingExplanationSnapshot($first['pricingExplanation']),
            $this->pricingExplanationSnapshot($second['pricingExplanation'])
        );
    }

    public function test_cod_enabled_booking_requires_vendor_cod_capability_approval(): void
    {
        $this->createDomesticVendorWithPolicyModules([
            'codFee' => [
                'enabled' => true,
                'flatFee' => 2,
                'percentOfDeclaredValue' => 3,
            ],
        ]);

        $user = User::factory()->create();
        $payload = $this->buildPayload([
            'shipment' => [
                'codEnabled' => true,
                'codAmount' => 300,
                'codPaymentMethod' => 'cash',
            ],
        ]);
        $csrfToken = 'advanced-policy-test-token-cod-capability-required';

        $response = $this->actingAs($user)
            ->withSession(['_token' => $csrfToken, 'courier_preview' => $payload])
            ->post(route('couriers.store'), $payload + ['_token' => $csrfToken]);

        $response->assertSessionHasErrors('shipment.codEnabled');
        $this->assertSame(0, CourierShipment::query()->where('requested_by_user_id', $user->id)->count());
    }

    public function test_cod_enabled_booking_persists_cod_fields_when_vendor_capability_is_approved(): void
    {
        $vendor = $this->createDomesticVendorWithPolicyModules([
            'codFee' => [
                'enabled' => true,
                'flatFee' => 2,
                'percentOfDeclaredValue' => 3,
            ],
        ]);
        $this->enableVendorDomesticCodCheckout((int) $vendor->id);
        $capability = $this->approveVendorCodCapability((int) $vendor->id);

        $result = $this->submitShipment([
            'shipment' => [
                'codEnabled' => true,
                'codAmount' => 300,
                'codPaymentMethod' => 'cash',
            ],
        ]);

        $shipment = $result['shipment'];
        $this->assertTrue((bool) $shipment->is_cod_enabled);
        $this->assertEqualsWithDelta(300.0, (float) ($shipment->cod_requested_amount ?? 0), 0.01);
        $this->assertSame('cash', (string) $shipment->cod_requested_method);
        $this->assertSame((int) $capability->id, (int) ($shipment->cod_capability_id ?? 0));
    }

    public function test_cod_enabled_booking_is_blocked_for_international_routes(): void
    {
        $vendor = $this->createLogisticVendorWithPolicyModules([
            'codFee' => [
                'enabled' => true,
                'flatFee' => 2,
                'percentOfDeclaredValue' => 3,
            ],
        ]);
        $this->enableVendorDomesticCodCheckout((int) $vendor->id);
        $this->approveVendorCodCapability((int) $vendor->id);

        $user = User::factory()->create();
        $payload = $this->buildPayload([
            'sender' => [
                'address' => [
                    'country' => 'US',
                ],
            ],
            'shipment' => [
                'codEnabled' => true,
                'codAmount' => 300,
                'codPaymentMethod' => 'cash',
            ],
        ]);
        $csrfToken = 'advanced-policy-test-token-cod-domestic-only';

        $response = $this->actingAs($user)
            ->withSession(['_token' => $csrfToken, 'courier_preview' => $payload])
            ->post(route('couriers.store'), $payload + ['_token' => $csrfToken]);

        $response->assertSessionHasErrors('shipment.codEnabled');
        $this->assertSame(0, CourierShipment::query()->where('requested_by_user_id', $user->id)->count());
    }

    public function test_pricing_explanation_payload_snapshot_is_stable_for_remote_and_minimum_rules(): void
    {
        $this->createDomesticVendorWithPolicyModules([
            'remoteAreaSurcharge' => [
                'enabled' => true,
                'flatFee' => 10,
                'applyOnOrigin' => false,
                'applyOnDestination' => true,
                'postalCodePrefixes' => ['200'],
            ],
            'minimumShipmentCharge' => [
                'enabled' => true,
                'minimumTotal' => 70,
            ],
        ]);

        $result = $this->submitShipment([
            'recipient' => [
                'address' => [
                    'postalCode' => '20010',
                ],
            ],
        ]);

        $this->assertSame([
            'mode' => 'fallback_quotes',
            'reason' => 'Lane matrix pricing is disabled for this category.',
            'distanceKm' => null,
            'matchedRule' => null,
            'speedEtaTier' => null,
            'logisticDimensions' => null,
            'policyAdjustments' => [
                ['key' => 'remote_area_surcharge', 'amount' => 10.0],
                ['key' => 'minimum_shipment_guardrail', 'amount' => 10.0],
            ],
            'totalEstimatedUsd' => 70.0,
        ], $this->pricingExplanationSnapshot($result['pricingExplanation']));
    }

    public function test_policy_conflict_between_contract_discount_and_minimum_guardrail_resolves_to_floor(): void
    {
        $this->createDomesticVendorWithPolicyModules([
            'customerContractPricing' => [
                'enabled' => true,
                'contracts' => [
                    [
                        'enabled' => true,
                        'allAccounts' => true,
                        'effectiveFrom' => now()->subDay()->toDateString(),
                        'effectiveTo' => now()->addDay()->toDateString(),
                        'negotiatedRateType' => 'percent_off',
                        'negotiatedRateValue' => 80,
                    ],
                ],
            ],
            'minimumShipmentCharge' => [
                'enabled' => true,
                'minimumTotal' => 30,
            ],
        ]);

        $result = $this->submitShipment();

        $this->assertEqualsWithDelta(30.0, $result['estimatedCost'], 0.01);
        $this->assertPolicyAdjustmentExists($result['pricingExplanation'], 'contract_negotiated_rate_discount', -40.0);
        $this->assertPolicyAdjustmentExists($result['pricingExplanation'], 'minimum_shipment_guardrail', 20.0);
    }

    public function test_customer_contract_negotiated_rate_is_applied(): void
    {
        $this->createDomesticVendorWithPolicyModules([
            'customerContractPricing' => [
                'enabled' => true,
                'contracts' => [
                    [
                        'enabled' => true,
                        'allAccounts' => true,
                        'effectiveFrom' => now()->subDay()->toDateString(),
                        'effectiveTo' => now()->addDay()->toDateString(),
                        'negotiatedRateType' => 'percent_off',
                        'negotiatedRateValue' => 20,
                    ],
                ],
            ],
        ]);

        $result = $this->submitShipment();

        $this->assertEqualsWithDelta(40.0, $result['estimatedCost'], 0.01);
        $this->assertPolicyAdjustmentExists($result['pricingExplanation'], 'contract_negotiated_rate_discount', -10.0);
    }

    public function test_customer_contract_volume_tier_is_applied_when_renewed(): void
    {
        $this->createDomesticVendorWithPolicyModules([
            'customerContractPricing' => [
                'enabled' => true,
                'contracts' => [
                    [
                        'enabled' => true,
                        'allAccounts' => true,
                        'effectiveFrom' => now()->subMonths(2)->toDateString(),
                        'effectiveTo' => now()->subDay()->toDateString(),
                        'autoRenew' => true,
                        'renewalCycleDays' => 30,
                        'volumeMetric' => 'current_shipment_weight_kg',
                        'volumeTiers' => [
                            [
                                'enabled' => true,
                                'minVolume' => 5,
                                'adjustmentType' => 'flat_off',
                                'adjustmentValue' => 5,
                            ],
                        ],
                    ],
                ],
            ],
        ]);

        $result = $this->submitShipment();

        $this->assertEqualsWithDelta(45.0, $result['estimatedCost'], 0.01);
        $this->assertPolicyAdjustmentExists($result['pricingExplanation'], 'contract_volume_tier_discount', -5.0);
    }

    public function test_customer_contract_outside_effective_range_without_renewal_is_not_applied(): void
    {
        $this->createDomesticVendorWithPolicyModules([
            'customerContractPricing' => [
                'enabled' => true,
                'contracts' => [
                    [
                        'enabled' => true,
                        'allAccounts' => true,
                        'effectiveFrom' => now()->subMonths(2)->toDateString(),
                        'effectiveTo' => now()->subMonth()->toDateString(),
                        'autoRenew' => false,
                        'negotiatedRateType' => 'percent_off',
                        'negotiatedRateValue' => 20,
                    ],
                ],
            ],
        ]);

        $result = $this->submitShipment();

        $this->assertEqualsWithDelta(50.0, $result['estimatedCost'], 0.01);
        $this->assertPolicyAdjustmentMissing($result['pricingExplanation'], 'contract_negotiated_rate_discount');
    }

    private function createDomesticVendorWithPolicyModules(array $policyModules): User
    {
        return $this->createVendorWithPolicyModules($policyModules, 'domestic', 'Courier Domestic');
    }

    private function createLogisticVendorWithPolicyModules(array $policyModules): User
    {
        return $this->createVendorWithPolicyModules($policyModules, 'logistic', 'Courier Logistic');
    }

    private function createVendorWithPolicyModules(array $policyModules, string $subCategorySlug, string $subCategoryName): User
    {
        $vendor = User::factory()->create([
            'role' => 'vendor',
            'status' => 'verified',
        ]);

        $category = ServiceCategory::query()->firstOrCreate(
            ['slug' => 'courier-services'],
            [
                'name' => 'Courier Services',
                'description' => 'Courier service category for tests',
                'display_order' => 1,
                'is_active' => true,
            ]
        );

        $subCategory = ServiceSubCategory::query()->firstOrCreate(
            [
                'service_category_id' => $category->id,
                'slug' => $subCategorySlug,
            ],
            [
                'name' => $subCategoryName,
                'description' => sprintf('Courier %s category for tests', $subCategorySlug),
                'required_fields' => [],
                'display_order' => 1,
                'is_active' => true,
            ]
        );

        $registration = VendorServiceRegistration::query()->create([
            'user_id' => $vendor->id,
            'service_category_id' => $category->id,
            'service_sub_category_id' => $subCategory->id,
            'field_values' => [],
            'status' => 'approved',
            'submitted_at' => now(),
            'reviewed_at' => now(),
        ]);

        $this->app->bind(CourierVendorAssignmentService::class, function () use ($vendor, $registration, $subCategory) {
            return new class($vendor->id, $registration->id, (string) $subCategory->slug) extends CourierVendorAssignmentService {
                public function __construct(
                    private int $vendorId,
                    private int $registrationId,
                    private string $subCategorySlug
                ) {
                }

                public function determineAssignment(CourierShipment $shipment): array
                {
                    return [
                        'assignment_category' => $this->subCategorySlug === 'logistic' ? 'logistic' : 'domestic',
                        'assignment_status' => 'assigned',
                        'assigned_vendor_user_id' => $this->vendorId,
                        'assigned_vendor_registration_id' => $this->registrationId,
                        'assigned_at' => now(),
                    ];
                }

                public function assignShipment(CourierShipment $shipment): void
                {
                    $shipment->update($this->determineAssignment($shipment));
                }
            };
        });

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
                            $subCategorySlug => $policyModules,
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
            ->withSession(['_token' => $csrfToken, 'courier_preview' => $payload])
            ->post(route('couriers.store'), $payload + ['_token' => $csrfToken]);

        $response->assertRedirect(route('couriers.create'));
        $response->assertSessionHas('success');
        $response->assertSessionHas('courier_pricing_explanation');

        $shipment = CourierShipment::query()
            ->where('requested_by_user_id', $user->id)
            ->latest('id')
            ->first();
        $this->assertNotNull($shipment);

        $pricingExplanation = $response->baseResponse->getSession()->get('courier_pricing_explanation');
        $this->assertIsArray($pricingExplanation);

        return [
            'estimatedCost' => (float) ($shipment->estimated_cost ?? 0),
            'shipment' => $shipment->fresh(),
            'pricingExplanation' => $pricingExplanation,
        ];
    }

    private function enableVendorDomesticCodCheckout(int $vendorId): void
    {
        $settings = VendorCourierSetting::query()
            ->where('vendor_user_id', $vendorId)
            ->value('settings');
        $settings = is_array($settings) ? $settings : [];

        $services = is_array($settings['services'] ?? null) ? $settings['services'] : [];
        $cod = is_array($services['cod'] ?? null) ? $services['cod'] : [];

        $services['cod'] = array_replace([
            'acceptCodAtCheckout' => false,
            'allowCodForDomestic' => true,
            'allowCodForInternational' => false,
            'allowTeamOverride' => false,
        ], $cod, [
            'acceptCodAtCheckout' => true,
            'allowCodForDomestic' => true,
            'allowCodForInternational' => false,
        ]);

        $settings['services'] = $services;

        VendorCourierSetting::query()->updateOrCreate(
            ['vendor_user_id' => $vendorId],
            ['settings' => $settings]
        );
    }

    private function approveVendorCodCapability(int $vendorId): CourierVendorCodCapability
    {
        return CourierVendorCodCapability::query()->updateOrCreate(
            ['vendor_user_id' => $vendorId],
            [
                'status' => CourierVendorCodCapability::STATUS_APPROVED,
                'requested_at' => now()->subHour(),
                'reviewed_at' => now(),
                'approved_at' => now(),
            ]
        );
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

    private function assertPolicyAdjustmentMissing(array $pricingExplanation, string $key): void
    {
        $adjustment = collect($pricingExplanation['policyAdjustments'] ?? [])
            ->first(fn ($item) => is_array($item) && ($item['key'] ?? null) === $key);

        $this->assertNull($adjustment, sprintf('Policy adjustment "%s" should not be present.', $key));
    }

    private function pricingExplanationSnapshot(array $pricingExplanation): array
    {
        return [
            'mode' => (string) ($pricingExplanation['mode'] ?? ''),
            'reason' => $pricingExplanation['reason'] ?? null,
            'distanceKm' => $pricingExplanation['distanceKm'] ?? null,
            'matchedRule' => $pricingExplanation['matchedRule'] ?? null,
            'speedEtaTier' => $pricingExplanation['speedEtaTier'] ?? null,
            'logisticDimensions' => $pricingExplanation['logisticDimensions'] ?? null,
            'policyAdjustments' => collect($pricingExplanation['policyAdjustments'] ?? [])
                ->map(function ($adjustment) {
                    return [
                        'key' => (string) ($adjustment['key'] ?? ''),
                        'amount' => round((float) ($adjustment['amount'] ?? 0), 2),
                    ];
                })
                ->values()
                ->all(),
            'totalEstimatedUsd' => round((float) ($pricingExplanation['totalEstimatedUsd'] ?? 0), 2),
        ];
    }
}
