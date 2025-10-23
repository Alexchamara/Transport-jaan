<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\VehicleMedia;

class VehicleMediaSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = Vehicle::limit(2)->get();

        foreach ($vehicles as $vehicle) {
            VehicleMedia::create([
                'vehicle_id' => $vehicle->id,
                'media_type' => 'image',
                'title' => 'Front View',
                'path' => 'vehicles/media/' . $vehicle->id . '_front.jpg',
                'is_primary' => true,
                'sort_order' => 1,
            ]);

            VehicleMedia::create([
                'vehicle_id' => $vehicle->id,
                'media_type' => 'image',
                'title' => 'Interior View',
                'path' => 'vehicles/media/' . $vehicle->id . '_interior.jpg',
                'is_primary' => false,
                'sort_order' => 2,
            ]);
        }
    }
}
