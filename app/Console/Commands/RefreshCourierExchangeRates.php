<?php

namespace App\Console\Commands;

use App\Models\Courier\VendorCourierSetting;
use App\Services\Courier\CourierExchangeRateService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RefreshCourierExchangeRates extends Command
{
    protected $signature = 'courier:refresh-exchange-rates {--vendor= : Refresh only one vendor_user_id} {--dry-run : Run without persisting updates}';

    protected $description = 'Refresh and persist courier pricing exchange rates for vendors with live-rate strategy enabled';

    public function handle(CourierExchangeRateService $exchangeRateService): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $vendorFilter = $this->option('vendor');

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No settings updates will be saved.');
        }

        $query = VendorCourierSetting::query();
        if (is_numeric($vendorFilter)) {
            $query->where('vendor_user_id', (int) $vendorFilter);
        }

        $total = 0;
        $skipped = 0;
        $updated = 0;
        $failed = 0;

        $query->orderBy('id')->chunkById(100, function ($records) use (&$total, &$skipped, &$updated, &$failed, $dryRun, $exchangeRateService) {
            foreach ($records as $record) {
                $total++;
                $settings = is_array($record->settings) ? $record->settings : [];
                $pricing = is_array($settings['pricing'] ?? null) ? $settings['pricing'] : [];
                $localizationInput = is_array($pricing['localization'] ?? null) ? $pricing['localization'] : [];
                $hasCategoryLocalization = is_array($localizationInput['domestic'] ?? null) || is_array($localizationInput['logistic'] ?? null);
                $localizationByCategory = $hasCategoryLocalization
                    ? $localizationInput
                    : [
                        'domestic' => $localizationInput,
                        'logistic' => $localizationInput,
                    ];

                $updatedInRecord = false;

                foreach (['domestic', 'logistic'] as $category) {
                    $localization = is_array($localizationByCategory[$category] ?? null) ? $localizationByCategory[$category] : [];
                    $autoLiveRates = (bool) ($localization['autoLiveRates'] ?? false);
                    if (!$autoLiveRates) {
                        continue;
                    }

                    $baseCurrency = strtoupper(trim((string) ($localization['baseCurrency'] ?? 'LKR')));
                    if ($baseCurrency === '') {
                        $baseCurrency = 'LKR';
                    }

                    $manualRates = is_array($localization['manualRates'] ?? null) ? $localization['manualRates'] : [];
                    $targets = collect(array_keys($manualRates))
                        ->map(fn ($currency) => strtoupper(trim((string) $currency)))
                        ->filter(fn ($currency) => $currency !== '' && $currency !== $baseCurrency)
                        ->unique()
                        ->values()
                        ->all();

                    if (count($targets) === 0) {
                        $displayCurrency = strtoupper(trim((string) ($localization['displayCurrency'] ?? '')));
                        if ($displayCurrency !== '' && $displayCurrency !== $baseCurrency) {
                            $targets[] = $displayCurrency;
                        }
                    }

                    $payload = $exchangeRateService->latest($baseCurrency, $targets);
                    if (!($payload['ok'] ?? false)) {
                        $failed++;
                        Log::warning('Daily courier exchange-rate refresh failed for vendor category.', [
                            'vendor_user_id' => (int) $record->vendor_user_id,
                            'category' => $category,
                            'base' => $baseCurrency,
                            'targets' => $targets,
                            'message' => (string) ($payload['message'] ?? 'Unknown error'),
                        ]);
                        continue;
                    }

                    $rates = is_array($payload['rates'] ?? null) ? $payload['rates'] : [];
                    $nextManualRates = array_merge($manualRates, $rates);
                    $nextManualRates[$baseCurrency] = 1.0;

                    $localizationByCategory[$category] = array_replace($localization, [
                        'manualRates' => $nextManualRates,
                        'lastSyncedAt' => (string) ($payload['date'] ?? now()->toDateString()),
                        'exchangeRateProvider' => (string) ($payload['provider'] ?? 'frankfurter.app'),
                    ]);

                    $updatedInRecord = true;
                }

                if (!$updatedInRecord) {
                    $skipped++;
                    continue;
                }

                if (!$dryRun) {
                    $pricing['localization'] = $localizationByCategory;
                    $settings['pricing'] = $pricing;
                    $record->update(['settings' => $settings]);
                }

                $updated++;
            }
        });

        $this->info("Processed: {$total}");
        $this->info("Updated: {$updated}");
        $this->line("Skipped (auto-live off): {$skipped}");

        if ($failed > 0) {
            $this->warn("Failed: {$failed}");
        }

        return self::SUCCESS;
    }
}
