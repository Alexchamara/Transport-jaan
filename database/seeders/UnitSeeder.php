<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Unit;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            [
                'brand' => 'Toyota',
                'model' => 'Prius',
                'price_per_day' => 65.00,
                'status' => 'Available',
                'units_count' => 3,
                'mileage' => '25,000',
                'transmission' => 'Auto',
                'capacity' => '5 Person',
                'fuel_type' => 'Hybrid',
                'image_path' => 'units/toyota_prius.jpg',
            ],
            [
                'brand' => 'Honda',
                'model' => 'Civic',
                'price_per_day' => 55.00,
                'status' => 'Available',
                'units_count' => 5,
                'mileage' => '18,000',
                'transmission' => 'Manual',
                'capacity' => '5 Person',
                'fuel_type' => 'Petrol',
                'image_path' => 'units/honda_civic.jpg',
            ],
        ];

        foreach ($units as $unit) {
            Unit::create($unit);
        }
    }
}
