<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\VehicleMedia;

class VehicleMediaSeeder extends Seeder
{
    public function run(): void
    {
        $map = [
            'ABC-1234' => [
                ['media_type' => 'image', 'title' => 'Front', 'path' => 'vehicles/ABC-1234/front.jpg', 'is_primary' => true, 'sort_order' => 1],
                ['media_type' => 'image', 'title' => 'Interior', 'path' => 'vehicles/ABC-1234/interior.jpg', 'sort_order' => 2],
            ],
            'SUV-7777' => [
                ['media_type' => 'image', 'title' => 'Front', 'path' => 'vehicles/SUV-7777/front.jpg', 'is_primary' => true, 'sort_order' => 1],
            ],
            '4R-ABC' => [
                ['media_type' => 'image', 'title' => 'Aircraft', 'path' => 'vehicles/4R-ABC/main.jpg', 'is_primary' => true, 'sort_order' => 1],
            ],
            '4R-HLC' => [
                ['media_type' => 'image', 'title' => 'Helicopter', 'path' => 'vehicles/4R-HLC/main.jpg', 'is_primary' => true, 'sort_order' => 1],
            ],
            'SL-YAC-8899' => [
                ['media_type' => 'image', 'title' => 'Yacht', 'path' => 'vehicles/SL-YAC-8899/main.jpg', 'is_primary' => true, 'sort_order' => 1],
            ],
            'SL-BOAT-1122' => [
                ['media_type' => 'image', 'title' => 'Speed Boat', 'path' => 'vehicles/SL-BOAT-1122/main.jpg', 'is_primary' => true, 'sort_order' => 1],
            ],
        ];

        foreach ($map as $reg => $medias) {
            $vehicle = Vehicle::where('registration_number', $reg)->first();
            if (!$vehicle) continue;

            foreach ($medias as $m) {
                VehicleMedia::firstOrCreate(
                    ['vehicle_id' => $vehicle->id, 'path' => $m['path']],
                    $m + ['vehicle_id' => $vehicle->id]
                );
            }
        }
    }
}
