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

            if ($courierCategoryIds->isEmpty()) {
                return;
            }

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
                    $internationalRegistrations = DB::table('vendor_service_registrations')
                        ->where('service_sub_category_id', $international->id)
                        ->get(['id', 'user_id']);

                    foreach ($internationalRegistrations as $registration) {
                        $hasLogisticRegistration = DB::table('vendor_service_registrations')
                            ->where('user_id', $registration->user_id)
                            ->where('service_sub_category_id', $logistic->id)
                            ->exists();

                        if ($hasLogisticRegistration) {
                            DB::table('vendor_service_registrations')
                                ->where('id', $registration->id)
                                ->delete();

                            continue;
                        }

                        DB::table('vendor_service_registrations')
                            ->where('id', $registration->id)
                            ->update(['service_sub_category_id' => $logistic->id]);
                    }

                    DB::table('service_sub_categories')
                        ->where('id', $international->id)
                        ->delete();
                } elseif ($international && !$logistic) {
                    DB::table('service_sub_categories')
                        ->where('id', $international->id)
                        ->update([
                            'name' => 'Logistic',
                            'slug' => 'logistic',
                            'description' => 'Logistic courier services',
                            'updated_at' => now(),
                        ]);
                }

                DB::table('service_sub_categories')
                    ->where('service_category_id', $categoryId)
                    ->where('slug', 'logistic')
                    ->where('name', 'International')
                    ->update([
                        'name' => 'Logistic',
                        'description' => 'Logistic courier services',
                        'updated_at' => now(),
                    ]);
            }
        });
    }

    public function down(): void
    {
        // Intentionally left blank: this data normalization is one-way.
    }
};
