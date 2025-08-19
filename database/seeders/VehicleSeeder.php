<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Models\User;
use Illuminate\Support\Carbon;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@demo.test')->first();
        $provider1 = User::where('email', 'provider1@demo.test')->first();
        $provider2 = User::where('email', 'provider2@demo.test')->first();

        // LAND vehicles
        $sedanCat = VehicleCategory::where('type','land')->where('name','Sedan')->first();
        $suvCat = VehicleCategory::where('type','land')->where('name','SUV')->first();

        Vehicle::firstOrCreate(
            ['registration_number' => 'ABC-1234'],
            [
                'provider_id' => optional($provider1)->id,
                'type' => 'land',
                'category_id' => optional($sedanCat)->id,
                'model' => 'Civic',
                'manufacturer' => 'Honda',
                'manufacture_year' => 2021,
                'registration_year' => 2021,
                'colour' => 'Blue',
                'condition' => 'used',
                'ownership_type' => 'partner_owned',
                'passenger_capacity' => 5,
                'mileage_km' => 32000,
                'rental_price_per_day' => 9500.00,
                'deposit_amount' => 30000.00,
                'advance_payment_amount' => 9500.00,
                'currency' => 'LKR',
                'insurance_provider' => 'AIA',
                'gps' => true,
                'child_seat' => false,
                'wifi' => false,
                'insurance_coverage' => true,
                'contact_name' => 'Ravi Perera',
                'contact_email' => 'ravi@example.com',
                'contact_phone' => '+94-71-111-2222',
                'address' => '123 Galle Rd',
                'city' => 'Colombo',
                'state' => 'Western',
                'postal_code' => '00300',
                'country' => 'LK',
                'status' => 'active',
                'approval_status' => 'approved',
                'approved_by' => optional($admin)->id,
                'approved_at' => Carbon::now(),
                'description' => 'Reliable sedan with good mileage.',
            ]
        );

        Vehicle::firstOrCreate(
            ['registration_number' => 'SUV-7777'],
            [
                'provider_id' => optional($provider1)->id,
                'type' => 'land',
                'category_id' => optional($suvCat)->id,
                'model' => 'RAV4',
                'manufacturer' => 'Toyota',
                'manufacture_year' => 2022,
                'registration_year' => 2023,
                'colour' => 'White',
                'condition' => 'new',
                'ownership_type' => 'company_owned',
                'passenger_capacity' => 7,
                'mileage_km' => 5000,
                'rental_price_per_day' => 14500.00,
                'deposit_amount' => 50000.00,
                'advance_payment_amount' => 14500.00,
                'currency' => 'LKR',
                'insurance_provider' => 'Ceylinco',
                'gps' => true,
                'wifi' => true,
                'insurance_coverage' => true,
                'contact_name' => 'Nadeesha Silva',
                'contact_email' => 'nadeesha@example.com',
                'contact_phone' => '+94-77-222-3333',
                'address' => '456 Kandy Rd',
                'city' => 'Kandy',
                'state' => 'Central',
                'postal_code' => '20000',
                'country' => 'LK',
                'status' => 'active',
                'approval_status' => 'approved',
                'approved_by' => optional($admin)->id,
                'approved_at' => Carbon::now(),
                'description' => 'Spacious SUV ideal for family trips.',
            ]
        );

        // AIR vehicles
        $fixedCat = VehicleCategory::where('type','air')->where('name','Fixed Wing')->first();
        $heliCat = VehicleCategory::where('type','air')->where('name','Helicopter')->first();

        Vehicle::firstOrCreate(
            ['registration_number' => '4R-ABC'],
            [
                'provider_id' => optional($provider2)->id,
                'type' => 'air',
                'category_id' => optional($fixedCat)->id,
                'model' => 'Cessna 172',
                'manufacturer' => 'Cessna',
                'manufacture_year' => 2015,
                'registration_year' => 2016,
                'colour' => 'White/Blue',
                'condition' => 'used',
                'ownership_type' => 'partner_owned',
                'passenger_capacity' => 4,
                'mileage_km' => null,
                'rental_price_per_day' => 250000.00,
                'deposit_amount' => 200000.00,
                'advance_payment_amount' => 125000.00,
                'currency' => 'LKR',
                'insurance_provider' => 'Allianz',
                'gps' => true,
                'wifi' => false,
                'insurance_coverage' => true,
                'contact_name' => 'Aero Ops',
                'contact_email' => 'ops@aero.test',
                'contact_phone' => '+94-11-555-0101',
                'address' => 'Bandaranaike Intl Airport',
                'city' => 'Katunayake',
                'state' => 'Western',
                'postal_code' => '11450',
                'country' => 'LK',
                'status' => 'active',
                'approval_status' => 'approved',
                'approved_by' => optional($admin)->id,
                'approved_at' => Carbon::now(),
                'description' => 'Reliable training/touring aircraft.',
            ]
        );

        Vehicle::firstOrCreate(
            ['registration_number' => '4R-HLC'],
            [
                'provider_id' => optional($provider2)->id,
                'type' => 'air',
                'category_id' => optional($heliCat)->id,
                'model' => 'Bell 206',
                'manufacturer' => 'Bell',
                'manufacture_year' => 2013,
                'registration_year' => 2014,
                'colour' => 'Red',
                'condition' => 'used',
                'ownership_type' => 'partner_owned',
                'passenger_capacity' => 5,
                'rental_price_per_day' => 550000.00,
                'deposit_amount' => 300000.00,
                'advance_payment_amount' => 275000.00,
                'currency' => 'LKR',
                'insurance_provider' => 'Allianz',
                'gps' => true,
                'wifi' => false,
                'insurance_coverage' => true,
                'contact_name' => 'Heli Ops',
                'contact_email' => 'ops@heli.test',
                'contact_phone' => '+94-11-555-0202',
                'address' => 'Ratmalana Airport',
                'city' => 'Dehiwala',
                'state' => 'Western',
                'postal_code' => '10350',
                'country' => 'LK',
                'status' => 'active',
                'approval_status' => 'approved',
                'approved_by' => optional($admin)->id,
                'approved_at' => Carbon::now(),
                'description' => 'Helicopter for charters & tours.',
            ]
        );

        // SEA vehicles
        $yachtCat = VehicleCategory::where('type','sea')->where('name','Yacht')->first();
        $boatCat = VehicleCategory::where('type','sea')->where('name','Boat')->first();

        Vehicle::firstOrCreate(
            ['registration_number' => 'SL-YAC-8899'],
            [
                'provider_id' => optional($provider2)->id,
                'type' => 'sea',
                'category_id' => optional($yachtCat)->id,
                'model' => 'Sun Odyssey 449',
                'manufacturer' => 'Jeanneau',
                'manufacture_year' => 2019,
                'registration_year' => 2020,
                'colour' => 'Navy Blue',
                'condition' => 'used',
                'ownership_type' => 'partner_owned',
                'passenger_capacity' => 10,
                'rental_price_per_day' => 350000.00,
                'deposit_amount' => 200000.00,
                'advance_payment_amount' => 175000.00,
                'currency' => 'LKR',
                'insurance_provider' => 'Orient',
                'gps' => true,
                'wifi' => true,
                'insurance_coverage' => true,
                'contact_name' => 'Marina Ops',
                'contact_email' => 'ops@marina.test',
                'contact_phone' => '+94-71-333-4444',
                'address' => 'Galle Harbour',
                'city' => 'Galle',
                'state' => 'Southern',
                'postal_code' => '80000',
                'country' => 'LK',
                'status' => 'active',
                'approval_status' => 'approved',
                'approved_by' => optional($admin)->id,
                'approved_at' => Carbon::now(),
                'description' => 'Luxury yacht for charters.',
            ]
        );

        Vehicle::firstOrCreate(
            ['registration_number' => 'SL-BOAT-1122'],
            [
                'provider_id' => optional($provider1)->id,
                'type' => 'sea',
                'category_id' => optional($boatCat)->id,
                'model' => 'Speedster 200',
                'manufacturer' => 'Sea Ray',
                'manufacture_year' => 2018,
                'registration_year' => 2018,
                'colour' => 'White',
                'condition' => 'used',
                'ownership_type' => 'partner_owned',
                'passenger_capacity' => 6,
                'rental_price_per_day' => 120000.00,
                'deposit_amount' => 80000.00,
                'advance_payment_amount' => 60000.00,
                'currency' => 'LKR',
                'insurance_provider' => 'Peoples',
                'gps' => true,
                'wifi' => false,
                'insurance_coverage' => true,
                'contact_name' => 'Harbour Ops',
                'contact_email' => 'ops@harbour.test',
                'contact_phone' => '+94-71-999-0000',
                'address' => 'Trincomalee Harbour',
                'city' => 'Trincomalee',
                'state' => 'Eastern',
                'postal_code' => '31000',
                'country' => 'LK',
                'status' => 'active',
                'approval_status' => 'approved',
                'approved_by' => optional($admin)->id,
                'approved_at' => Carbon::now(),
                'description' => 'Fast speed boat for day trips.',
            ]
        );
    }
}
