<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\SeaVehicleSpec;

class SeaVehicleSpecSeeder extends Seeder
{
    public function run(): void
    {
        $map = [
            'SL-YAC-8899' => [
                'vessel_type' => 'yacht',
                'hull_material' => 'fiberglass',
                'length_m' => 13.34,
                'beam_m' => 4.24,
                'draft_m' => 2.20,
                'engine_type' => 'inboard',
                'engine_power_hp' => 57,
                'fuel_type' => 'diesel',
                'cabins' => 3,
                'berths' => 8,
                'toilets' => 2,
                'fuel_tank_l' => 200.0,
                'water_tank_l' => 330.0,
            ],
            'SL-BOAT-1122' => [
                'vessel_type' => 'boat',
                'hull_material' => 'fiberglass',
                'length_m' => 6.40,
                'beam_m' => 2.50,
                'draft_m' => 0.80,
                'engine_type' => 'outboard',
                'engine_power_hp' => 150,
                'fuel_type' => 'petrol',
                'cabins' => 0,
                'berths' => 0,
                'toilets' => 0,
                'fuel_tank_l' => 120.0,
                'water_tank_l' => 0.0,
            ],
        ];

        foreach ($map as $reg => $spec) {
            $vehicle = Vehicle::where('registration_number', $reg)->first();
            if ($vehicle) {
                SeaVehicleSpec::firstOrCreate(
                    ['vehicle_id' => $vehicle->id],
                    $spec
                );
            }
        }
    }
}
