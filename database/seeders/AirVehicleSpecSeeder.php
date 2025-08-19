<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\AirVehicleSpec;

class AirVehicleSpecSeeder extends Seeder
{
    public function run(): void
    {
        $map = [
            '4R-ABC' => [
                'aircraft_type' => 'fixed_wing',
                'icao_type_designator' => 'C172',
                'base_airport_iata' => 'CMB',
                'base_airport_icao' => 'VCBI',
                'seats' => 4,
                'crew_required' => 1,
                'range_km' => 1289,
                'mtow_kg' => 1111,
                'cruising_speed_kts' => 122,
                'fuel_type' => 'avgas',
                'flight_hours_total' => 3200,
            ],
            '4R-HLC' => [
                'aircraft_type' => 'helicopter',
                'icao_type_designator' => 'B06',
                'base_airport_iata' => 'RML',
                'base_airport_icao' => 'VCCC',
                'seats' => 5,
                'crew_required' => 1,
                'range_km' => 690,
                'mtow_kg' => 1451,
                'cruising_speed_kts' => 110,
                'fuel_type' => 'jet_a1',
                'flight_hours_total' => 2400,
            ],
        ];

        foreach ($map as $reg => $spec) {
            $vehicle = Vehicle::where('registration_number', $reg)->first();
            if ($vehicle) {
                AirVehicleSpec::firstOrCreate(
                    ['vehicle_id' => $vehicle->id],
                    $spec
                );
            }
        }
    }
}
