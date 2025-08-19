<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\User;
use App\Models\VehicleCrew;
use Illuminate\Support\Carbon;

class VehicleCrewSeeder extends Seeder
{
    public function run(): void
    {
        $driver = User::where('email', 'driver@demo.test')->first();
        $pilot = User::where('email', 'pilot@demo.test')->first();
        $captain = User::where('email', 'captain@demo.test')->first();

        $links = [
            ['reg' => 'ABC-1234', 'user' => $driver, 'role' => 'driver', 'license_number' => 'B1234567', 'license_type' => 'Light Vehicle', 'license_expiry' => Carbon::now()->addYears(2)->toDateString(), 'rating' => 5],
            ['reg' => 'SUV-7777', 'user' => $driver, 'role' => 'driver', 'license_number' => 'B7654321', 'license_type' => 'Heavy Vehicle', 'license_expiry' => Carbon::now()->addYears(3)->toDateString(), 'rating' => 4],
            ['reg' => '4R-ABC', 'user' => $pilot, 'role' => 'pilot', 'license_number' => 'ATPL-1001', 'license_type' => 'ATPL', 'license_expiry' => Carbon::now()->addYears(1)->toDateString(), 'rating' => 5],
            ['reg' => '4R-HLC', 'user' => $pilot, 'role' => 'pilot', 'license_number' => 'CPLH-2042', 'license_type' => 'CPL(H)', 'license_expiry' => Carbon::now()->addYears(2)->toDateString(), 'rating' => 5],
            ['reg' => 'SL-YAC-8899', 'user' => $captain, 'role' => 'captain', 'license_number' => 'CG-MSTR-77', 'license_type' => 'Master', 'license_expiry' => Carbon::now()->addYears(2)->toDateString(), 'rating' => 5],
            ['reg' => 'SL-BOAT-1122', 'user' => $captain, 'role' => 'captain', 'license_number' => 'CG-CAP-12', 'license_type' => 'Captain', 'license_expiry' => Carbon::now()->addYears(3)->toDateString(), 'rating' => 4],
        ];

        foreach ($links as $link) {
            $vehicle = Vehicle::where('registration_number', $link['reg'])->first();
            if ($vehicle && $link['user']) {
                VehicleCrew::firstOrCreate(
                    ['vehicle_id' => $vehicle->id, 'user_id' => $link['user']->id, 'role' => $link['role']],
                    [
                        'license_number' => $link['license_number'],
                        'license_type' => $link['license_type'],
                        'license_expiry' => $link['license_expiry'],
                        'rating' => $link['rating'],
                    ]
                );
            }
        }
    }
}
