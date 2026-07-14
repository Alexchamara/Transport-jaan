<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            $courierCategoryIds = DB::table('service_categories')
                ->where('slug', 'courier-services')
                ->pluck('id');

            if ($courierCategoryIds->isNotEmpty()) {
                foreach ($courierCategoryIds as $categoryId) {
                    $logistic = DB::table('service_sub_categories')
                        ->where('service_category_id', $categoryId)
                        ->where('slug', 'logistic')
                        ->first(['id']);

                    $international = DB::table('service_sub_categories')
                        ->where('service_category_id', $categoryId)
                        ->where('slug', 'international')
                        ->first(['id']);

                    if ($logistic && $international) {
                        $logisticRegistrations = DB::table('vendor_service_registrations')
                            ->where('service_sub_category_id', $logistic->id)
                            ->get(['id', 'user_id']);

                        foreach ($logisticRegistrations as $registration) {
                            $hasInternationalRegistration = DB::table('vendor_service_registrations')
                                ->where('user_id', $registration->user_id)
                                ->where('service_sub_category_id', $international->id)
                                ->exists();

                            if ($hasInternationalRegistration) {
                                DB::table('vendor_service_registrations')
                                    ->where('id', $registration->id)
                                    ->delete();

                                continue;
                            }

                            DB::table('vendor_service_registrations')
                                ->where('id', $registration->id)
                                ->update(['service_sub_category_id' => $international->id]);
                        }

                        DB::table('service_sub_categories')
                            ->where('id', $logistic->id)
                            ->delete();

                        DB::table('service_sub_categories')
                            ->where('id', $international->id)
                            ->update([
                                'name' => 'International',
                                'description' => 'International courier services',
                                'updated_at' => now(),
                            ]);
                    } elseif ($logistic && !$international) {
                        DB::table('service_sub_categories')
                            ->where('id', $logistic->id)
                            ->update([
                                'name' => 'International',
                                'slug' => 'international',
                                'description' => 'International courier services',
                                'updated_at' => now(),
                            ]);
                    } elseif ($international) {
                        DB::table('service_sub_categories')
                            ->where('id', $international->id)
                            ->update([
                                'name' => 'International',
                                'description' => 'International courier services',
                                'updated_at' => now(),
                            ]);
                    }

                    DB::table('service_sub_categories')
                        ->where('service_category_id', $categoryId)
                        ->where('slug', 'international')
                        ->where('name', 'Logistic')
                        ->update([
                            'name' => 'International',
                            'description' => 'International courier services',
                            'updated_at' => now(),
                        ]);
                }
            }

            DB::table('courier_shipments')
                ->where('assignment_category', 'logistic')
                ->update(['assignment_category' => 'international']);

            DB::table('courier_vendor_label_templates')
                ->where('category_scope', 'logistic')
                ->update(['category_scope' => 'international']);

            DB::table('courier_vendor_labels')
                ->where('category', 'logistic')
                ->update(['category' => 'international']);

            $settingsRows = DB::table('courier_vendor_settings')
                ->select('id', 'settings')
                ->get();

            foreach ($settingsRows as $row) {
                if (!$row->settings) {
                    continue;
                }

                $settings = is_array($row->settings)
                    ? $row->settings
                    : json_decode($row->settings, true);

                if (!is_array($settings)) {
                    continue;
                }

                $normalized = $this->renameLogisticKeys($settings);

                if ($normalized !== $settings) {
                    DB::table('courier_vendor_settings')
                        ->where('id', $row->id)
                        ->update(['settings' => json_encode($normalized)]);
                }
            }
        });
    }

    public function down(): void
    {
        // Intentionally left blank: this data normalization is one-way.
    }

    private function renameLogisticKeys($value)
    {
        if (is_array($value)) {
            $normalized = [];

            foreach ($value as $key => $item) {
                $newKey = is_string($key) ? $this->mapLogisticString($key) : $key;

                $normalized[$newKey] = $this->renameLogisticKeys($item);
            }

            return $normalized;
        }

        if (is_string($value)) {
            return $this->mapLogisticString($value);
        }

        return $value;
    }

    private function mapLogisticString(string $value): string
    {
        $map = [
            'logistic' => 'international',
            'Logistic' => 'International',
            'LOGISTIC' => 'INTERNATIONAL',
            'logisticDimensionsEngine' => 'internationalDimensionsEngine',
            'enforceForLogisticOnly' => 'enforceForInternationalOnly',
            'strictForLogistic' => 'strictForInternational',
        ];

        return $map[$value] ?? $value;
    }
};
