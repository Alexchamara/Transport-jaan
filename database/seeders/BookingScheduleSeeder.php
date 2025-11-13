<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\BookingSchedule;

class BookingScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $bookings = Booking::limit(2)->get();

        foreach ($bookings as $index => $booking) {
            BookingSchedule::create([
                'booking_id' => $booking->id,
                'pickup_at' => now()->addDays(5 + $index)->setHour(10)->setMinute(0),
                'pickup_location' => $index === 0 ? 'Bandaranaike International Airport' : 'Ratmalana Airport',
                'dropoff_at' => now()->addDays(5 + $index + $booking->rental_days)->setHour(18)->setMinute(0),
                'dropoff_location' => $index === 0 ? 'Galle Face Hotel, Colombo' : 'Waters Edge, Battaramulla',
            ]);
        }
    }
}
