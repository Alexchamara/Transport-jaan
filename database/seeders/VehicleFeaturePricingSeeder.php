<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\VehicleFeaturePricing;

class VehicleFeaturePricingSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = Vehicle::limit(2)->get();

        foreach ($vehicles as $vehicle) {
            $features = $vehicle->type === 'land'
                ? [
                    ['additional_feature_name' => 'GPS Navigation', 'additional_feature_price' => 10.00],
                    ['additional_feature_name' => 'Child Safety Seat', 'additional_feature_price' => 15.00],
                ]
                : [
                    ['additional_feature_name' => 'In-flight Catering', 'additional_feature_price' => 500.00],
                    ['additional_feature_name' => 'Ground Transportation', 'additional_feature_price' => 200.00],
                ];

            foreach ($features as $feature) {
                VehicleFeaturePricing::create(array_merge(
                    ['vehicle_id' => $vehicle->id],
                    $feature
                ));
            }
        }
    }
}
