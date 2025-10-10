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

            DriverSeeder::class,
            DemoUsersSeeder::class,
            BusStationSeeder::class,
            BusSeeder::class,
            BusScheduleSeeder::class,
            SuperAdminSeeder::class,
            LandVehicleSpecSeeder::class,
            VendorUsersSeeder::class,
            TrainStationSeeder::class,
            TrainSeeder::class,
            TrainScheduleSeeder::class,
            WarehouseUnitSeeder::class,

        ]);
    }
}
