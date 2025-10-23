<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\AirVehicleSpec;

class AirVehicleSpecSeeder extends Seeder
{
    public function run(): void
    {
        $airVehicles = Vehicle::where('type', 'air')->get();

        if ($airVehicles->isEmpty()) {
            return;
        }

        $specs = [
            [
                'aircraft_type' => 'fixed_wing',
                'icao_type_designator' => 'C25C',
                'base_airport_iata' => 'CMB',
                'base_airport_icao' => 'VCBI',
                'seats' => 7,
                'crew_required' => 2,
                'range_km' => 3700,
                'mtow_kg' => 6250,
                'cruising_speed_kts' => 380,
                'fuel_type' => 'jet_a1',
                'flight_hours_total' => 1500,
            ],
        ];

        foreach ($airVehicles->take(count($specs)) as $index => $vehicle) {
            if (isset($specs[$index])) {
                AirVehicleSpec::create(array_merge(
                    ['vehicle_id' => $vehicle->id],
                    $specs[$index]
                ));
            }
        }
    }
}
