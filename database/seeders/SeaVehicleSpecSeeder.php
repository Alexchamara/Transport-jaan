<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\SeaVehicleSpec;

class SeaVehicleSpecSeeder extends Seeder
{
    public function run(): void
    {
        // Create sea vehicles first if needed
        $seaVehicles = Vehicle::where('type', 'sea')->get();

        if ($seaVehicles->isEmpty()) {
            return;
        }

        $specs = [
            [
                'vessel_type' => 'yacht',
                'hull_material' => 'Fiberglass',
                'length_m' => 15.50,
                'beam_m' => 4.20,
                'draft_m' => 1.80,
                'engine_type' => 'inboard',
                'engine_power_hp' => 450,
                'fuel_type' => 'diesel',
                'cabins' => 3,
                'berths' => 6,
                'toilets' => 2,
                'fuel_tank_l' => 800.00,
                'water_tank_l' => 500.00,
            ],
        ];

        foreach ($seaVehicles->take(count($specs)) as $index => $vehicle) {
            if (isset($specs[$index])) {
                SeaVehicleSpec::create(array_merge(
                    ['vehicle_id' => $vehicle->id],
                    $specs[$index]
                ));
            }
        }
    }
}
