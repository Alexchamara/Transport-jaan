<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
     

         $this->call([
            VehicleCategorySeeder::class,
            DemoUsersSeeder::class,
            VehicleSeeder::class,
            LandVehicleSpecSeeder::class,
            AirVehicleSpecSeeder::class,
            SeaVehicleSpecSeeder::class,
            VehicleMediaSeeder::class,
            VehicleDocumentSeeder::class,
            VehicleCrewSeeder::class,
        ]);
    }
}
