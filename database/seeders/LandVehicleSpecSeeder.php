<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\LandVehicleSpec;

class LandVehicleSpecSeeder extends Seeder
{
    public function run(): void
    {
        $map = [
            'ABC-1234' => [
                'body_type' => 'Sedan',
                'fuel_type' => 'petrol',
                'transmission_type' => 'automatic',
                'gears' => 6,
                'seats' => 5,
                'doors' => 4,
                'fuel_tank_capacity_l' => 47.0,
            ],
            'SUV-7777' => [
                'body_type' => 'SUV',
                'fuel_type' => 'diesel',
                'transmission_type' => 'automatic',
                'gears' => 6,
                'seats' => 7,
                'doors' => 5,
                'fuel_tank_capacity_l' => 55.0,
            ],
        ];

        foreach ($map as $reg => $spec) {
            $vehicle = Vehicle::where('registration_number', $reg)->first();
            if ($vehicle) {
                LandVehicleSpec::firstOrCreate(
                    ['vehicle_id' => $vehicle->id],
                    $spec
                );
            }
        }
    }
}
