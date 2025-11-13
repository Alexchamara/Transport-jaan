<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\BookingCustomer;

class BookingCustomerSeeder extends Seeder
{
    public function run(): void
    {
        $bookings = Booking::limit(2)->get();

        $customers = [
            [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john.doe@example.com',
                'phone' => '+94771234567',
                'country_code' => 'lk',
                'city' => 'Colombo',
                'zip_code' => '00100',
                'age' => 35,
            ],
            [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'email' => 'jane.smith@example.com',
                'phone' => '+94779876543',
                'country_code' => 'lk',
                'city' => 'Kandy',
                'zip_code' => '20000',
                'age' => 42,
            ],
        ];

        foreach ($bookings as $index => $booking) {
            if (isset($customers[$index])) {
                BookingCustomer::create(array_merge(
                    ['booking_id' => $booking->id],
                    $customers[$index]
                ));
            }
        }
    }
}
