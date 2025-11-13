<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\VehicleCrew;
use App\Models\User;

class VehicleCrewSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = Vehicle::limit(2)->get();
        $drivers = User::where('role', 'driver')->limit(2)->get();

        if ($drivers->isEmpty() || $vehicles->isEmpty()) {
            return;
        }

        foreach ($vehicles as $index => $vehicle) {
            if (isset($drivers[$index])) {
                $role = $vehicle->type === 'land' ? 'driver' : ($vehicle->type === 'air' ? 'pilot' : 'captain');
                $licenseType = $vehicle->type === 'land' ? 'Class B' : ($vehicle->type === 'air' ? 'ATPL' : 'Yacht Master');

                VehicleCrew::create([
                    'vehicle_id' => $vehicle->id,
                    'user_id' => $drivers[$index]->id,
                    'role' => $role,
                    'license_number' => 'LIC-' . strtoupper(substr($vehicle->type, 0, 1)) . str_pad($index + 1, 5, '0', STR_PAD_LEFT),
                    'license_type' => $licenseType,
                    'license_expiry' => now()->addYears(2),
                    'rating' => 5,
                    'is_primary' => true,
                ]);
            }
        }
    }
}
