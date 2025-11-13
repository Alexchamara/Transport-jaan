<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FlightBooking;

class FlightBookingSeeder extends Seeder
{
    public function run(): void
    {
        $bookings = [
            [
                'name' => 'Michael Johnson',
                'email' => 'michael.j@example.com',
                'phone' => '+94771112233',
                'subject' => 'Business Trip to Singapore',
                'special_requests' => 'Window seat preferred, vegetarian meal',
                'trip_type' => 'return',
                'departure_date' => now()->addDays(20),
                'return_date' => now()->addDays(25),
                'departure_airport' => 'CMB - Bandaranaike International Airport',
                'arriving_airport' => 'SIN - Singapore Changi Airport',
                'status' => 'pending',
            ],
            [
                'name' => 'Sarah Williams',
                'email' => 'sarah.w@example.com',
                'phone' => '+94772223344',
                'subject' => 'Holiday Trip to Maldives',
                'special_requests' => 'Extra baggage allowance needed',
                'trip_type' => 'oneway',
                'departure_date' => now()->addDays(45),
                'return_date' => null,
                'departure_airport' => 'CMB - Bandaranaike International Airport',
                'arriving_airport' => 'MLE - Velana International Airport',
                'status' => 'confirmed',
            ],
        ];

        foreach ($bookings as $booking) {
            FlightBooking::create($booking);
        }
    }
}
