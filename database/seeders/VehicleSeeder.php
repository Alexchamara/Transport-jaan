<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Models\User;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        // Get a provider user (vendor)
        $provider = User::where('role', 'vendor')->first();

        // Get categories
        $carCategory = VehicleCategory::where('type', 'land')->where('name', 'Car')->first();
        $jetCategory = VehicleCategory::where('type', 'air')->where('name', 'Private Jet')->first();

        $vehicles = [
            [
                'provider_id' => $provider?->id,
                'type' => 'land',
                'category_id' => $carCategory?->id,
                'model' => 'Camry',
                'manufacturer' => 'Toyota',
                'manufacture_year' => 2022,
                'registration_year' => 2022,
                'registration_number' => 'ABC-1234',
                'colour' => 'Silver',
                'condition' => 'new',
                'ownership_type' => 'company_owned',
                'passenger_capacity' => 5,
                'mileage_km' => 15000,
                'rental_price_per_day' => 75.00,
                'total_rental_price' => 2250.00,
                'deposit_amount' => 200.00,
                'advance_payment_amount' => 150.00,
                'currency' => 'USD',
                'insurance_provider' => 'ABC Insurance',
                'gps' => true,
                'child_seat' => true,
                'wifi' => true,
                'insurance_coverage' => true,
                'extra' => 'Bluetooth audio system, USB charging ports',
                'status' => 'active',
                'approval_status' => 'approved',
                'description' => 'Comfortable sedan perfect for family trips and business travel.',
            ],
            [
                'provider_id' => $provider?->id,
                'type' => 'air',
                'category_id' => $jetCategory?->id,
                'model' => 'Citation CJ3',
                'manufacturer' => 'Cessna',
                'manufacture_year' => 2020,
                'registration_year' => 2020,
                'registration_number' => 'N123JET',
                'colour' => 'White',
                'condition' => 'new',
                'ownership_type' => 'company_owned',
                'passenger_capacity' => 7,
                'mileage_km' => null,
                'rental_price_per_day' => 5000.00,
                'total_rental_price' => 150000.00,
                'deposit_amount' => 10000.00,
                'advance_payment_amount' => 25000.00,
                'currency' => 'USD',
                'insurance_provider' => 'Global Aviation Insurance',
                'gps' => true,
                'child_seat' => false,
                'wifi' => true,
                'insurance_coverage' => true,
                'extra' => 'Leather interior, refreshment bar, satellite phone',
                'status' => 'active',
                'approval_status' => 'approved',
                'description' => 'Luxury private jet for executive travel and special occasions.',
            ],
        ];

        foreach ($vehicles as $vehicle) {
            Vehicle::create($vehicle);
        }
    }
}
