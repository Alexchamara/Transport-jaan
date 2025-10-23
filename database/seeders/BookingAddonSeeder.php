<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\BookingAddon;

class BookingAddonSeeder extends Seeder
{
    public function run(): void
    {
        $bookings = Booking::limit(2)->get();

        foreach ($bookings as $index => $booking) {
            if ($index === 0) {
                BookingAddon::create([
                    'booking_id' => $booking->id,
                    'name' => 'GPS Navigation',
                    'price' => 10.00,
                    'qty' => 1,
                    'line_total' => 10.00,
                ]);

                BookingAddon::create([
                    'booking_id' => $booking->id,
                    'name' => 'Child Safety Seat',
                    'price' => 15.00,
                    'qty' => 2,
                    'line_total' => 30.00,
                ]);
            } else {
                BookingAddon::create([
                    'booking_id' => $booking->id,
                    'name' => 'In-flight Catering',
                    'price' => 500.00,
                    'qty' => 1,
                    'line_total' => 500.00,
                ]);

                BookingAddon::create([
                    'booking_id' => $booking->id,
                    'name' => 'Ground Transportation',
                    'price' => 200.00,
                    'qty' => 1,
                    'line_total' => 200.00,
                ]);
            }
        }
    }
}
