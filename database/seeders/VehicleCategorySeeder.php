<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VehicleCategory;

class VehicleCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // LAND
            ['type' => 'land', 'name' => 'Sedan'],
            ['type' => 'land', 'name' => 'SUV'],
            ['type' => 'land', 'name' => 'Van'],
            ['type' => 'land', 'name' => 'Bus'],
            ['type' => 'land', 'name' => 'Pickup'],
            ['type' => 'land', 'name' => 'Jeep'],
            // AIR
            ['type' => 'air', 'name' => 'Fixed Wing'],
            ['type' => 'air', 'name' => 'Helicopter'],
            // SEA
            ['type' => 'sea', 'name' => 'Boat'],
            ['type' => 'sea', 'name' => 'Yacht'],
            ['type' => 'sea', 'name' => 'Catamaran'],
            ['type' => 'sea', 'name' => 'Ferry'],
        ];

        foreach ($categories as $c) {
            VehicleCategory::firstOrCreate(
                ['type' => $c['type'], 'name' => $c['name']]
            );
        }
    }
}
