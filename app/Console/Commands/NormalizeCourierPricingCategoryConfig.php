<?php

namespace App\Console\Commands;

use App\Models\Courier\VendorCourierSetting;
use Illuminate\Console\Command;

class NormalizeCourierPricingCategoryConfig extends Command
{
    protected $signature = 'courier:normalize-pricing-category-config
        {--vendor= : Normalize only one vendor_user_id}
        {--dry-run : Preview changes without persisting updates}';

    protected $description = 'Normalize courier pricing JSON into domestic/logistic category-scoped structure';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $vendorFilter = $this->option('vendor');

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No pricing settings will be persisted.');
        }

        $query = VendorCourierSetting::query()->orderBy('id');
        if (is_numeric($vendorFilter)) {
            $query->where('vendor_user_id', (int) $vendorFilter);
        }

        $processed = 0;
        $updated = 0;
        $unchanged = 0;
        $skipped = 0;

        $query->chunkById(100, function ($records) use (&$processed, &$updated, &$unchanged, &$skipped, $dryRun) {
            foreach ($records as $record) {
                $processed++;

                $settings = is_array($record->settings) ? $record->settings : [];
                $pricing = is_array($settings['pricing'] ?? null) ? $settings['pricing'] : null;
                if (!is_array($pricing)) {
                    $skipped++;
                    continue;
                }

                $normalized = $this->normalizePricing($pricing);
                if ($this->sameJson($pricing, $normalized)) {
                    $unchanged++;
                    continue;
                }

                if (!$dryRun) {
                    $settings['pricing'] = $normalized;
                    $record->update(['settings' => $settings]);
                }

                $updated++;
            }
        });

        $this->info("Processed: {$processed}");
        $this->info("Updated: {$updated}");
        $this->line("Unchanged: {$unchanged}");
        $this->line("Skipped (no pricing): {$skipped}");

        return self::SUCCESS;
    }

    private function normalizePricing(array $pricing): array
    {
        $pricing['localization'] = $this->normalizeLocalization($pricing['localization'] ?? []);
        $pricing['formula'] = $this->normalizeFormula($pricing['formula'] ?? []);
        $pricing['zoneMaster'] = $this->normalizeZoneMaster($pricing['zoneMaster'] ?? []);
        $pricing['governance'] = $this->normalizeGovernance($pricing['governance'] ?? []);
        $pricing['laneMatrix'] = $this->normalizeLaneMatrix($pricing['laneMatrix'] ?? []);
        $pricing['policyModules'] = $this->normalizePolicyModules($pricing['policyModules'] ?? []);

        return $pricing;
    }

    private function normalizePolicyModules($input): array
    {
        $defaults = [
            'remoteAreaSurcharge' => [
                'enabled' => false,
                'flatFee' => 0,
                'applyOnOrigin' => false,
                'applyOnDestination' => true,
                'postalCodePrefixes' => [],
                'cityKeywords' => [],
            ],
            'oversizeOverweightRules' => [
                'enabled' => false,
                'maxWeightKg' => 25,
                'overweightPerKgFee' => 0,
                'maxLengthCm' => 120,
                'maxWidthCm' => 80,
                'maxHeightCm' => 80,
                'oversizeFlatFee' => 0,
            ],
            'peakHolidaySurcharge' => [
                'enabled' => false,
                'peakStartTime' => '17:00',
                'peakEndTime' => '21:00',
                'daysOfWeek' => [1, 2, 3, 4, 5],
                'peakPercent' => 0,
                'peakFlatFee' => 0,
                'holidayDates' => [],
                'holidayPercent' => 0,
                'holidayFlatFee' => 0,
            ],
            'codFee' => [
                'enabled' => false,
                'flatFee' => 0,
                'percentOfDeclaredValue' => 0,
                'minFee' => 0,
                'maxFee' => null,
            ],
            'minimumShipmentCharge' => [
                'enabled' => true,
                'minimumTotal' => 0,
            ],
            'customerContractPricing' => [
                'enabled' => false,
                'contracts' => [],
            ],
            'quoteRuntimeGovernance' => [
                'enabled' => false,
                'fieldLocks' => [
                    'enabled' => false,
                    'lockShipmentServiceLevel' => true,
                    'lockPackageServiceLevel' => true,
                    'lockPackageCourierProvider' => true,
                    'lockQuoteTotal' => true,
                ],
                'discountGuardrails' => [
                    'enabled' => false,
                    'maxDiscountPercent' => 0,
                    'maxDiscountAmountUsd' => 0,
                ],
                'floorPriceGuardrail' => [
                    'enabled' => false,
                    'minimumTotalUsd' => 0,
                ],
            ],
            'speedEtaTierEngine' => [
                'enabled' => false,
                'enforceFixedNamedTiers' => true,
                'enforceTierPricingMultiplier' => true,
                'tiers' => [
                    'priority_4h' => [
                        'enabled' => true,
                        'etaLabel' => 'Priority 4 Hours',
                        'etaMinDays' => 0,
                        'etaMaxDays' => 0,
                        'priceMultiplier' => 1.45,
                        'maxDistanceKm' => 35,
                        'maxWeightKg' => 12,
                        'minLeadHours' => 0.5,
                        'maxLeadHours' => 4,
                        'allowedPickupDays' => [1, 2, 3, 4, 5, 6, 7],
                        'blackoutDates' => [],
                    ],
                    'same_day' => [
                        'enabled' => true,
                        'etaLabel' => 'Same Day',
                        'etaMinDays' => 0,
                        'etaMaxDays' => 1,
                        'priceMultiplier' => 1.25,
                        'maxDistanceKm' => 80,
                        'maxWeightKg' => 20,
                        'minLeadHours' => 1,
                        'maxLeadHours' => 12,
                        'allowedPickupDays' => [1, 2, 3, 4, 5, 6, 7],
                        'blackoutDates' => [],
                    ],
                    'next_day' => [
                        'enabled' => true,
                        'etaLabel' => 'Next Day',
                        'etaMinDays' => 1,
                        'etaMaxDays' => 2,
                        'priceMultiplier' => 1.12,
                        'maxDistanceKm' => 250,
                        'maxWeightKg' => 30,
                        'minLeadHours' => 2,
                        'maxLeadHours' => null,
                        'allowedPickupDays' => [1, 2, 3, 4, 5, 6, 7],
                        'blackoutDates' => [],
                    ],
                    'two_three_day' => [
                        'enabled' => true,
                        'etaLabel' => '2-3 Days',
                        'etaMinDays' => 2,
                        'etaMaxDays' => 3,
                        'priceMultiplier' => 1.0,
                        'maxDistanceKm' => null,
                        'maxWeightKg' => null,
                        'minLeadHours' => 0,
                        'maxLeadHours' => null,
                        'allowedPickupDays' => [1, 2, 3, 4, 5, 6, 7],
                        'blackoutDates' => [],
                    ],
                    'economy' => [
                        'enabled' => true,
                        'etaLabel' => 'Economy',
                        'etaMinDays' => 4,
                        'etaMaxDays' => 7,
                        'priceMultiplier' => 0.92,
                        'maxDistanceKm' => null,
                        'maxWeightKg' => null,
                        'minLeadHours' => 0,
                        'maxLeadHours' => null,
                        'allowedPickupDays' => [1, 2, 3, 4, 5, 6, 7],
                        'blackoutDates' => [],
                    ],
                ],
            ],
            'logisticDimensionsEngine' => [
                'enabled' => false,
                'enforceForLogisticOnly' => true,
                'unitTypeMultipliers' => [
                    'parcel' => 1.0,
                    'pallet' => 1.18,
                    'crate' => 1.24,
                    'container_20ft' => 1.55,
                    'container_40ft' => 1.85,
                ],
                'routeClassMultipliers' => [
                    'standard' => 1.0,
                    'express_corridor' => 1.12,
                    'remote_corridor' => 1.22,
                    'multimodal' => 1.3,
                ],
                'handlingClassMultipliers' => [
                    'standard' => 1.0,
                    'fragile' => 1.08,
                    'hazardous' => 1.2,
                    'cold_chain' => 1.18,
                    'heavy_lift' => 1.26,
                ],
                'w2wOption' => [
                    'enabled' => true,
                    'strictForLogistic' => true,
                    'defaultMode' => 'door_to_door',
                    'minimumUnitCount' => 1,
                    'maximumUnitCount' => null,
                    'modeMultipliers' => [
                        'door_to_door' => 1.15,
                        'port_to_port' => 0.92,
                        'hybrid' => 1.0,
                    ],
                ],
            ],
        ];

        $source = is_array($input) ? $input : [];
        $hasCategoryShape = is_array($source['domestic'] ?? null) || is_array($source['logistic'] ?? null);
        if (!$hasCategoryShape) {
            $source = [
                'domestic' => $source,
                'logistic' => $source,
            ];
        }

        $normalized = [];
        foreach (['domestic', 'logistic'] as $category) {
            $row = array_replace_recursive(
                $defaults,
                is_array($source[$category] ?? null) ? $source[$category] : []
            );

            $normalized[$category] = [
                'remoteAreaSurcharge' => [
                    'enabled' => (bool) ($row['remoteAreaSurcharge']['enabled'] ?? false),
                    'flatFee' => max(0, (float) ($row['remoteAreaSurcharge']['flatFee'] ?? 0)),
                    'applyOnOrigin' => (bool) ($row['remoteAreaSurcharge']['applyOnOrigin'] ?? false),
                    'applyOnDestination' => (bool) ($row['remoteAreaSurcharge']['applyOnDestination'] ?? true),
                    'postalCodePrefixes' => collect($row['remoteAreaSurcharge']['postalCodePrefixes'] ?? [])
                        ->map(fn ($item) => strtoupper(trim((string) $item)))
                        ->filter()
                        ->unique()
                        ->values()
                        ->all(),
                    'cityKeywords' => collect($row['remoteAreaSurcharge']['cityKeywords'] ?? [])
                        ->map(fn ($item) => strtolower(trim((string) $item)))
                        ->filter()
                        ->unique()
                        ->values()
                        ->all(),
                ],
                'oversizeOverweightRules' => [
                    'enabled' => (bool) ($row['oversizeOverweightRules']['enabled'] ?? false),
                    'maxWeightKg' => max(0.1, (float) ($row['oversizeOverweightRules']['maxWeightKg'] ?? 25)),
                    'overweightPerKgFee' => max(0, (float) ($row['oversizeOverweightRules']['overweightPerKgFee'] ?? 0)),
                    'maxLengthCm' => max(1, (float) ($row['oversizeOverweightRules']['maxLengthCm'] ?? 120)),
                    'maxWidthCm' => max(1, (float) ($row['oversizeOverweightRules']['maxWidthCm'] ?? 80)),
                    'maxHeightCm' => max(1, (float) ($row['oversizeOverweightRules']['maxHeightCm'] ?? 80)),
                    'oversizeFlatFee' => max(0, (float) ($row['oversizeOverweightRules']['oversizeFlatFee'] ?? 0)),
                ],
                'peakHolidaySurcharge' => [
                    'enabled' => (bool) ($row['peakHolidaySurcharge']['enabled'] ?? false),
                    'peakStartTime' => $this->normalizeTimeValue((string) ($row['peakHolidaySurcharge']['peakStartTime'] ?? '17:00')),
                    'peakEndTime' => $this->normalizeTimeValue((string) ($row['peakHolidaySurcharge']['peakEndTime'] ?? '21:00')),
                    'daysOfWeek' => collect($row['peakHolidaySurcharge']['daysOfWeek'] ?? [1, 2, 3, 4, 5])
                        ->map(fn ($item) => (int) $item)
                        ->filter(fn ($item) => $item >= 1 && $item <= 7)
                        ->unique()
                        ->values()
                        ->all(),
                    'peakPercent' => max(0, (float) ($row['peakHolidaySurcharge']['peakPercent'] ?? 0)),
                    'peakFlatFee' => max(0, (float) ($row['peakHolidaySurcharge']['peakFlatFee'] ?? 0)),
                    'holidayDates' => collect($row['peakHolidaySurcharge']['holidayDates'] ?? [])
                        ->map(fn ($item) => trim((string) $item))
                        ->filter(fn ($item) => preg_match('/^\d{4}-\d{2}-\d{2}$/', $item) === 1)
                        ->unique()
                        ->values()
                        ->all(),
                    'holidayPercent' => max(0, (float) ($row['peakHolidaySurcharge']['holidayPercent'] ?? 0)),
                    'holidayFlatFee' => max(0, (float) ($row['peakHolidaySurcharge']['holidayFlatFee'] ?? 0)),
                ],
                'codFee' => [
                    'enabled' => (bool) ($row['codFee']['enabled'] ?? false),
                    'flatFee' => max(0, (float) ($row['codFee']['flatFee'] ?? 0)),
                    'percentOfDeclaredValue' => max(0, (float) ($row['codFee']['percentOfDeclaredValue'] ?? 0)),
                    'minFee' => max(0, (float) ($row['codFee']['minFee'] ?? 0)),
                    'maxFee' => isset($row['codFee']['maxFee']) && $row['codFee']['maxFee'] !== ''
                        ? max(0, (float) $row['codFee']['maxFee'])
                        : null,
                ],
                'minimumShipmentCharge' => [
                    'enabled' => (bool) ($row['minimumShipmentCharge']['enabled'] ?? true),
                    'minimumTotal' => max(0, (float) ($row['minimumShipmentCharge']['minimumTotal'] ?? 0)),
                ],
                'customerContractPricing' => [
                    'enabled' => (bool) ($row['customerContractPricing']['enabled'] ?? false),
                    'contracts' => collect($row['customerContractPricing']['contracts'] ?? [])
                        ->map(function ($contract) use ($category) {
                            $item = is_array($contract) ? $contract : [];
                            $allowedCategories = ['domestic', 'logistic'];
                            $normalizedContractCategory = strtolower(trim((string) ($item['category'] ?? '')));
                            if (!in_array($normalizedContractCategory, $allowedCategories, true)) {
                                $normalizedContractCategory = $category;
                            }

                            $normalizedContractCategories = collect($item['categories'] ?? [])
                                ->map(fn ($value) => strtolower(trim((string) $value)))
                                ->filter(fn ($value) => in_array($value, $allowedCategories, true))
                                ->unique()
                                ->values()
                                ->all();
                            if (empty($normalizedContractCategories)) {
                                $normalizedContractCategories = [$normalizedContractCategory];
                            }

                            $effectiveFrom = trim((string) ($item['effectiveFrom'] ?? ''));
                            $effectiveTo = trim((string) ($item['effectiveTo'] ?? ''));
                            $renewalCycleDays = max(0, (int) ($item['renewalCycleDays'] ?? 0));
                            $renewalGraceDays = max(0, (int) ($item['renewalGraceDays'] ?? 0));
                            $maxRenewals = max(0, (int) ($item['maxRenewals'] ?? 0));

                            $volumeLookbackDays = max(1, (int) ($item['volumeLookbackDays'] ?? 30));
                            $volumeMetric = strtolower(trim((string) ($item['volumeMetric'] ?? 'shipment_count_30d')));
                            if ($volumeMetric === '') {
                                $volumeMetric = 'shipment_count_30d';
                            }

                            $volumeTiers = collect($item['volumeTiers'] ?? [])
                                ->map(function ($tier) {
                                    $tierRow = is_array($tier) ? $tier : [];
                                    $minVolume = max(0, (float) ($tierRow['minVolume'] ?? 0));
                                    $hasMaxVolume = isset($tierRow['maxVolume']) && $tierRow['maxVolume'] !== '' && $tierRow['maxVolume'] !== null;

                                    return [
                                        'enabled' => (bool) ($tierRow['enabled'] ?? true),
                                        'minVolume' => $minVolume,
                                        'maxVolume' => $hasMaxVolume ? max($minVolume, (float) $tierRow['maxVolume']) : null,
                                        'adjustmentType' => strtolower(trim((string) ($tierRow['adjustmentType'] ?? 'percent_off'))),
                                        'adjustmentValue' => max(0, (float) ($tierRow['adjustmentValue'] ?? 0)),
                                    ];
                                })
                                ->values()
                                ->all();

                            return [
                                'enabled' => (bool) ($item['enabled'] ?? true),
                                'priority' => (int) ($item['priority'] ?? 0),
                                'allAccounts' => (bool) ($item['allAccounts'] ?? false),
                                'accountUserId' => (int) ($item['accountUserId'] ?? 0),
                                'accountUserIds' => collect($item['accountUserIds'] ?? [])
                                    ->map(fn ($value) => (int) $value)
                                    ->filter(fn ($value) => $value > 0)
                                    ->unique()
                                    ->values()
                                    ->all(),
                                'category' => $normalizedContractCategory,
                                'categories' => $normalizedContractCategories,
                                'effectiveFrom' => preg_match('/^\d{4}-\d{2}-\d{2}$/', $effectiveFrom) === 1 ? $effectiveFrom : null,
                                'effectiveTo' => preg_match('/^\d{4}-\d{2}-\d{2}$/', $effectiveTo) === 1 ? $effectiveTo : null,
                                'autoRenew' => (bool) ($item['autoRenew'] ?? false),
                                'renewalCycleDays' => $renewalCycleDays,
                                'renewalGraceDays' => $renewalGraceDays,
                                'maxRenewals' => $maxRenewals,
                                'negotiatedRateType' => strtolower(trim((string) ($item['negotiatedRateType'] ?? ''))),
                                'negotiatedRateValue' => max(0, (float) ($item['negotiatedRateValue'] ?? 0)),
                                'minimumTotal' => max(0, (float) ($item['minimumTotal'] ?? 0)),
                                'volumeMetric' => $volumeMetric,
                                'volumeLookbackDays' => $volumeLookbackDays,
                                'volumeTiers' => $volumeTiers,
                            ];
                        })
                        ->values()
                        ->all(),
                ],
                'quoteRuntimeGovernance' => [
                    'enabled' => (bool) ($row['quoteRuntimeGovernance']['enabled'] ?? false),
                    'fieldLocks' => [
                        'enabled' => (bool) ($row['quoteRuntimeGovernance']['fieldLocks']['enabled'] ?? false),
                        'lockShipmentServiceLevel' => (bool) ($row['quoteRuntimeGovernance']['fieldLocks']['lockShipmentServiceLevel'] ?? true),
                        'lockPackageServiceLevel' => (bool) ($row['quoteRuntimeGovernance']['fieldLocks']['lockPackageServiceLevel'] ?? true),
                        'lockPackageCourierProvider' => (bool) ($row['quoteRuntimeGovernance']['fieldLocks']['lockPackageCourierProvider'] ?? true),
                        'lockQuoteTotal' => (bool) ($row['quoteRuntimeGovernance']['fieldLocks']['lockQuoteTotal'] ?? true),
                    ],
                    'discountGuardrails' => [
                        'enabled' => (bool) ($row['quoteRuntimeGovernance']['discountGuardrails']['enabled'] ?? false),
                        'maxDiscountPercent' => max(0, (float) ($row['quoteRuntimeGovernance']['discountGuardrails']['maxDiscountPercent'] ?? 0)),
                        'maxDiscountAmountUsd' => max(0, (float) ($row['quoteRuntimeGovernance']['discountGuardrails']['maxDiscountAmountUsd'] ?? 0)),
                    ],
                    'floorPriceGuardrail' => [
                        'enabled' => (bool) ($row['quoteRuntimeGovernance']['floorPriceGuardrail']['enabled'] ?? false),
                        'minimumTotalUsd' => max(0, (float) ($row['quoteRuntimeGovernance']['floorPriceGuardrail']['minimumTotalUsd'] ?? 0)),
                    ],
                ],
                'speedEtaTierEngine' => [
                    'enabled' => (bool) ($row['speedEtaTierEngine']['enabled'] ?? false),
                    'enforceFixedNamedTiers' => (bool) ($row['speedEtaTierEngine']['enforceFixedNamedTiers'] ?? true),
                    'enforceTierPricingMultiplier' => (bool) ($row['speedEtaTierEngine']['enforceTierPricingMultiplier'] ?? true),
                    'tiers' => collect(array_values(array_unique(array_merge(
                        array_keys(is_array($defaults['speedEtaTierEngine']['tiers'] ?? null) ? $defaults['speedEtaTierEngine']['tiers'] : []),
                        array_keys(is_array($row['speedEtaTierEngine']['tiers'] ?? null) ? $row['speedEtaTierEngine']['tiers'] : [])
                    ))))
                        ->mapWithKeys(function ($tierKey) use ($row, $defaults) {
                            $fallbackTier = is_array($defaults['speedEtaTierEngine']['tiers'][$tierKey] ?? null)
                                ? $defaults['speedEtaTierEngine']['tiers'][$tierKey]
                                : [];
                            $tierInput = is_array($row['speedEtaTierEngine']['tiers'][$tierKey] ?? null)
                                ? $row['speedEtaTierEngine']['tiers'][$tierKey]
                                : [];
                            $tierRow = array_replace(
                                is_array($fallbackTier) ? $fallbackTier : [],
                                is_array($tierInput) ? $tierInput : []
                            );

                            $etaMinDays = max(0, (int) ($tierRow['etaMinDays'] ?? 0));
                            $etaMaxDays = isset($tierRow['etaMaxDays']) && $tierRow['etaMaxDays'] !== '' && $tierRow['etaMaxDays'] !== null
                                ? max($etaMinDays, (int) $tierRow['etaMaxDays'])
                                : null;
                            $minLeadHours = max(0, (float) ($tierRow['minLeadHours'] ?? 0));
                            $maxLeadHours = isset($tierRow['maxLeadHours']) && $tierRow['maxLeadHours'] !== '' && $tierRow['maxLeadHours'] !== null
                                ? max($minLeadHours, (float) $tierRow['maxLeadHours'])
                                : null;
                            $allowedPickupDays = collect($tierRow['allowedPickupDays'] ?? [1, 2, 3, 4, 5, 6, 7])
                                ->map(fn ($item) => (int) $item)
                                ->filter(fn ($item) => $item >= 1 && $item <= 7)
                                ->unique()
                                ->values()
                                ->all();

                            return [
                                $tierKey => [
                                    'enabled' => (bool) ($tierRow['enabled'] ?? true),
                                    'etaLabel' => trim((string) ($tierRow['etaLabel'] ?? '')) ?: ucwords(str_replace('_', ' ', (string) $tierKey)),
                                    'etaMinDays' => $etaMinDays,
                                    'etaMaxDays' => $etaMaxDays,
                                    'priceMultiplier' => max(0.1, (float) ($tierRow['priceMultiplier'] ?? 1)),
                                    'maxDistanceKm' => isset($tierRow['maxDistanceKm']) && $tierRow['maxDistanceKm'] !== '' && $tierRow['maxDistanceKm'] !== null
                                        ? max(0.1, (float) $tierRow['maxDistanceKm'])
                                        : null,
                                    'maxWeightKg' => isset($tierRow['maxWeightKg']) && $tierRow['maxWeightKg'] !== '' && $tierRow['maxWeightKg'] !== null
                                        ? max(0.1, (float) $tierRow['maxWeightKg'])
                                        : null,
                                    'minLeadHours' => $minLeadHours,
                                    'maxLeadHours' => $maxLeadHours,
                                    'allowedPickupDays' => !empty($allowedPickupDays) ? $allowedPickupDays : [1, 2, 3, 4, 5, 6, 7],
                                    'blackoutDates' => collect($tierRow['blackoutDates'] ?? [])
                                        ->map(fn ($item) => trim((string) $item))
                                        ->filter(fn ($item) => preg_match('/^\d{4}-\d{2}-\d{2}$/', $item) === 1)
                                        ->unique()
                                        ->values()
                                        ->all(),
                                ],
                            ];
                        })
                        ->all(),
                ],
                'logisticDimensionsEngine' => [
                    'enabled' => (bool) ($row['logisticDimensionsEngine']['enabled'] ?? false),
                    'enforceForLogisticOnly' => (bool) ($row['logisticDimensionsEngine']['enforceForLogisticOnly'] ?? true),
                    'unitTypeMultipliers' => collect($row['logisticDimensionsEngine']['unitTypeMultipliers'] ?? [])
                        ->mapWithKeys(function ($value, $key) {
                            $normalizedKey = strtolower(trim((string) $key));
                            if ($normalizedKey === '') {
                                return [];
                            }

                            return [$normalizedKey => max(0.1, (float) $value)];
                        })
                        ->all(),
                    'routeClassMultipliers' => collect($row['logisticDimensionsEngine']['routeClassMultipliers'] ?? [])
                        ->mapWithKeys(function ($value, $key) {
                            $normalizedKey = strtolower(trim((string) $key));
                            if ($normalizedKey === '') {
                                return [];
                            }

                            return [$normalizedKey => max(0.1, (float) $value)];
                        })
                        ->all(),
                    'handlingClassMultipliers' => collect($row['logisticDimensionsEngine']['handlingClassMultipliers'] ?? [])
                        ->mapWithKeys(function ($value, $key) {
                            $normalizedKey = strtolower(trim((string) $key));
                            if ($normalizedKey === '') {
                                return [];
                            }

                            return [$normalizedKey => max(0.1, (float) $value)];
                        })
                        ->all(),
                    'w2wOption' => [
                        'enabled' => (bool) ($row['logisticDimensionsEngine']['w2wOption']['enabled'] ?? true),
                        'strictForLogistic' => (bool) ($row['logisticDimensionsEngine']['w2wOption']['strictForLogistic'] ?? true),
                        'defaultMode' => strtolower(trim((string) ($row['logisticDimensionsEngine']['w2wOption']['defaultMode'] ?? ''))),
                        'minimumUnitCount' => max(1, (int) ($row['logisticDimensionsEngine']['w2wOption']['minimumUnitCount'] ?? 1)),
                        'maximumUnitCount' => isset($row['logisticDimensionsEngine']['w2wOption']['maximumUnitCount'])
                            && $row['logisticDimensionsEngine']['w2wOption']['maximumUnitCount'] !== ''
                            && $row['logisticDimensionsEngine']['w2wOption']['maximumUnitCount'] !== null
                            ? max(1, (int) $row['logisticDimensionsEngine']['w2wOption']['maximumUnitCount'])
                            : null,
                        'modeMultipliers' => collect($row['logisticDimensionsEngine']['w2wOption']['modeMultipliers'] ?? [])
                            ->mapWithKeys(function ($value, $key) {
                                $normalizedKey = strtolower(trim((string) $key));
                                if ($normalizedKey === '') {
                                    return [];
                                }

                                return [$normalizedKey => max(0.1, (float) $value)];
                            })
                            ->all(),
                    ],
                ],
            ];
        }

        return $normalized;
    }

    private function normalizeLocalization($input): array
    {
        $defaults = [
            'baseCurrency' => 'LKR',
            'displayCurrency' => 'LKR',
            'locale' => 'en-LK',
            'exchangeRateProvider' => 'frankfurter.app',
            'autoLiveRates' => true,
            'manualRates' => [
                'LKR' => 1,
                'USD' => 0.00308,
                'EUR' => 0.00284,
            ],
            'lastSyncedAt' => null,
        ];

        $source = is_array($input) ? $input : [];
        $hasCategoryShape = is_array($source['domestic'] ?? null) || is_array($source['logistic'] ?? null);
        if (!$hasCategoryShape) {
            $source = [
                'domestic' => $source,
                'logistic' => $source,
            ];
        }

        $normalized = [];
        foreach (['domestic', 'logistic'] as $category) {
            $row = array_replace($defaults, is_array($source[$category] ?? null) ? $source[$category] : []);
            $base = strtoupper((string) ($row['baseCurrency'] ?? 'LKR'));
            $display = strtoupper((string) ($row['displayCurrency'] ?? $base));
            $rates = is_array($row['manualRates'] ?? null) ? $row['manualRates'] : [];
            $nextRates = [];

            foreach ($rates as $code => $rate) {
                $currency = strtoupper(trim((string) $code));
                if ($currency === '' || strlen($currency) !== 3) {
                    continue;
                }
                $nextRates[$currency] = max(0.000001, (float) $rate);
            }
            $nextRates[$base] = 1.0;

            $normalized[$category] = [
                'baseCurrency' => $base,
                'displayCurrency' => $display,
                'locale' => trim((string) ($row['locale'] ?? 'en-LK')) ?: 'en-LK',
                'exchangeRateProvider' => trim((string) ($row['exchangeRateProvider'] ?? 'frankfurter.app')) ?: 'frankfurter.app',
                'autoLiveRates' => (bool) ($row['autoLiveRates'] ?? true),
                'manualRates' => $nextRates,
                'lastSyncedAt' => $row['lastSyncedAt'] ?? null,
            ];
        }

        return $normalized;
    }

    private function normalizeFormula($input): array
    {
        $defaults = [
            'volumetricDivisor' => 5000,
            'useChargeableWeight' => true,
            'fuelSurchargePercent' => 0,
            'handlingFee' => 0,
            'taxPercent' => 0,
            'roundTo' => 2,
        ];

        $source = is_array($input) ? $input : [];
        $hasCategoryShape = is_array($source['domestic'] ?? null) || is_array($source['logistic'] ?? null);
        if (!$hasCategoryShape) {
            $source = [
                'domestic' => $source,
                'logistic' => $source,
            ];
        }

        $normalized = [];
        foreach (['domestic', 'logistic'] as $category) {
            $row = array_replace($defaults, is_array($source[$category] ?? null) ? $source[$category] : []);
            $normalized[$category] = [
                'volumetricDivisor' => max(1, (int) ($row['volumetricDivisor'] ?? 5000)),
                'useChargeableWeight' => (bool) ($row['useChargeableWeight'] ?? true),
                'fuelSurchargePercent' => max(0, (float) ($row['fuelSurchargePercent'] ?? 0)),
                'handlingFee' => max(0, (float) ($row['handlingFee'] ?? 0)),
                'taxPercent' => max(0, (float) ($row['taxPercent'] ?? 0)),
                'roundTo' => max(0, min(4, (int) ($row['roundTo'] ?? 2))),
            ];
        }

        return $normalized;
    }

    private function normalizeZoneMaster($input): array
    {
        $source = is_array($input) ? $input : [];
        $hasCategoryShape = is_array($source['domestic'] ?? null) || is_array($source['logistic'] ?? null);
        $flatRows = $hasCategoryShape ? [] : (array_values($source) === $source ? $source : []);

        $normalized = [];
        foreach (['domestic', 'logistic'] as $category) {
            $rows = $hasCategoryShape
                ? (is_array($source[$category] ?? null) ? $source[$category] : [])
                : $flatRows;

            $normalized[$category] = collect($rows)
                ->map(function ($item, $index) {
                    $row = is_array($item) ? $item : [];
                    $key = $this->normalizeZoneKey((string) ($row['key'] ?? $row['label'] ?? ''));
                    $label = trim((string) ($row['label'] ?? ''));

                    return [
                        'key' => $key,
                        'label' => $label !== '' ? $label : ucwords(str_replace('_', ' ', $key)),
                        'isActive' => (bool) ($row['isActive'] ?? true),
                        'sortOrder' => max(1, (int) ($row['sortOrder'] ?? ($index + 1))),
                    ];
                })
                ->filter(fn ($row) => ($row['key'] ?? '') !== '*' && trim((string) ($row['key'] ?? '')) !== '')
                ->unique('key')
                ->sortBy('sortOrder')
                ->values()
                ->all();
        }

        return $normalized;
    }

    private function normalizeGovernance($input): array
    {
        $defaults = [
            'requireApproval' => false,
            'approverRoles' => ['courier_owner', 'courier_admin'],
            'draftVersion' => 1,
            'publishedVersion' => 1,
            'publishedAt' => null,
            'publishedBy' => null,
            'pendingApproval' => null,
            'scheduledPublish' => null,
            'changeLog' => [],
        ];

        $source = is_array($input) ? $input : [];
        $hasCategoryShape = is_array($source['domestic'] ?? null) || is_array($source['logistic'] ?? null);
        if (!$hasCategoryShape) {
            $source = [
                'domestic' => $source,
                'logistic' => $source,
            ];
        }

        $normalized = [];
        foreach (['domestic', 'logistic'] as $category) {
            $row = array_replace($defaults, is_array($source[$category] ?? null) ? $source[$category] : []);
            $normalized[$category] = [
                'requireApproval' => (bool) ($row['requireApproval'] ?? false),
                'approverRoles' => collect($row['approverRoles'] ?? $defaults['approverRoles'])
                    ->map(fn ($role) => trim((string) $role))
                    ->filter()
                    ->unique()
                    ->values()
                    ->all(),
                'draftVersion' => max(1, (int) ($row['draftVersion'] ?? 1)),
                'publishedVersion' => max(1, (int) ($row['publishedVersion'] ?? 1)),
                'publishedAt' => $row['publishedAt'] ?? null,
                'publishedBy' => $row['publishedBy'] ?? null,
                'pendingApproval' => is_array($row['pendingApproval'] ?? null) ? $row['pendingApproval'] : null,
                'scheduledPublish' => is_array($row['scheduledPublish'] ?? null) ? $row['scheduledPublish'] : null,
                'changeLog' => collect($row['changeLog'] ?? [])
                    ->filter(fn ($entry) => is_array($entry))
                    ->take(50)
                    ->values()
                    ->all(),
            ];
        }

        return $normalized;
    }

    private function normalizeLaneMatrix($input): array
    {
        $source = is_array($input) ? $input : [];
        $enabled = $source['enabled'] ?? false;
        if (!is_array($enabled)) {
            $enabled = [
                'domestic' => (bool) $enabled,
                'logistic' => (bool) $enabled,
            ];
        }

        $normalizeRows = function ($rows, string $category): array {
            $items = is_array($rows) ? $rows : [];

            return collect($items)
                ->map(function ($item, $index) use ($category) {
                    $row = is_array($item) ? $item : [];
                    $distanceFrom = max(0, (float) ($row['distanceFromKm'] ?? 0));
                    $distanceTo = isset($row['distanceToKm']) && $row['distanceToKm'] !== ''
                        ? max($distanceFrom, (float) $row['distanceToKm'])
                        : null;

                    return [
                        'id' => trim((string) ($row['id'] ?? "{$category}_lane_{$index}")) ?: "{$category}_lane_{$index}",
                        'originZone' => $this->normalizeZoneKey((string) ($row['originZone'] ?? '*')),
                        'destinationZone' => $this->normalizeZoneKey((string) ($row['destinationZone'] ?? '*')),
                        'serviceLevelKey' => $this->normalizeServiceLevelKey((string) ($row['serviceLevelKey'] ?? '')),
                        'distanceFromKm' => $distanceFrom,
                        'distanceToKm' => $distanceTo,
                        'distanceBaseKm' => max(0, (float) ($row['distanceBaseKm'] ?? 0)),
                        'perKmPrice' => max(0, (float) ($row['perKmPrice'] ?? 0)),
                        'distanceSurcharge' => max(0, (float) ($row['distanceSurcharge'] ?? 0)),
                        'distanceMultiplier' => max(0.1, (float) ($row['distanceMultiplier'] ?? 1)),
                        'basePrice' => max(0, (float) ($row['basePrice'] ?? 0)),
                        'perKgPrice' => max(0, (float) ($row['perKgPrice'] ?? 0)),
                        'minPrice' => max(0, (float) ($row['minPrice'] ?? 0)),
                        'priorityMultiplier' => max(0.1, (float) ($row['priorityMultiplier'] ?? 1)),
                        'isActive' => (bool) ($row['isActive'] ?? true),
                    ];
                })
                ->values()
                ->all();
        };

        return [
            'enabled' => [
                'domestic' => (bool) ($enabled['domestic'] ?? false),
                'logistic' => (bool) ($enabled['logistic'] ?? false),
            ],
            'domestic' => $normalizeRows($source['domestic'] ?? [], 'domestic'),
            'logistic' => $normalizeRows($source['logistic'] ?? [], 'logistic'),
        ];
    }

    private function normalizeServiceLevelKey(string $value): string
    {
        $normalized = strtolower(trim($value));
        $normalized = preg_replace('/[^a-z0-9]+/i', '_', $normalized) ?? '';
        $normalized = trim($normalized, '_');

        return match ($normalized) {
            'priority_4h', 'priority4h', 'priority_4_hours', 'priority_4hour', '4h', 'rush_4h', 'rush4h' => 'priority_4h',
            'same_day', 'sameday' => 'same_day',
            'next_day', 'nextday', 'express', 'one_day', 'oneday' => 'next_day',
            '2_3_day', '2_3_days', 'two_three_day', 'standard', 'within_3_days' => 'two_three_day',
            default => $normalized,
        };
    }

    private function normalizeZoneKey(string $value): string
    {
        $trimmed = trim($value);
        if ($trimmed === '' || $trimmed === '*') {
            return '*';
        }

        $normalized = strtolower($trimmed);
        $normalized = preg_replace('/[^a-z0-9]+/i', '_', $normalized) ?? '';
        $normalized = trim($normalized, '_');

        return $normalized !== '' ? $normalized : '*';
    }

    private function normalizeTimeValue(string $value): string
    {
        if (preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $value)) {
            return $value;
        }

        return '00:00';
    }

    private function sameJson(array $left, array $right): bool
    {
        return json_encode($left) === json_encode($right);
    }
}
