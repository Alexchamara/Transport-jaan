<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\Vehicle;
use App\Models\User;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = Vehicle::limit(2)->get();
        $clients = User::where('role', 'client')->limit(2)->get();

        if ($vehicles->isEmpty() || $clients->isEmpty()) {
            return;
        }

        $bookings = [
            [
                'client_id' => $clients[0]->id ?? null,
                'vehicle_id' => $vehicles[0]->id ?? null,
                'status' => 'confirmed',
                'price_per_day' => 75.00,
                'rental_days' => 7,
                'addons_total' => 50.00,
                'subtotal' => 525.00,
                'deposit_amount' => 200.00,
                'advance_amount' => 150.00,
                'total_amount' => 725.00,
                'currency' => 'USD',
                'addons_snapshot' => json_encode([
                    ['name' => 'GPS Navigation', 'price' => 10.00, 'qty' => 1],
                    ['name' => 'Child Safety Seat', 'price' => 15.00, 'qty' => 1],
                ]),
                'vehicle_snapshot' => json_encode([
                    'model' => 'Camry',
                    'manufacturer' => 'Toyota',
                    'registration_number' => 'ABC-1234',
                ]),
                'notes' => 'Airport pickup required',
            ],
            [
                'client_id' => $clients->count() > 1 ? $clients[1]->id : $clients[0]->id,
                'vehicle_id' => $vehicles->count() > 1 ? $vehicles[1]->id : $vehicles[0]->id,
                'status' => 'pending',
                'price_per_day' => 5000.00,
                'rental_days' => 2,
                'addons_total' => 700.00,
                'subtotal' => 10000.00,
                'deposit_amount' => 10000.00,
                'advance_amount' => 25000.00,
                'total_amount' => 35700.00,
                'currency' => 'USD',
                'addons_snapshot' => json_encode([
                    ['name' => 'In-flight Catering', 'price' => 500.00, 'qty' => 1],
                    ['name' => 'Ground Transportation', 'price' => 200.00, 'qty' => 1],
                ]),
                'vehicle_snapshot' => json_encode([
                    'model' => 'Citation CJ3',
                    'manufacturer' => 'Cessna',
                    'registration_number' => 'N123JET',
                ]),
                'notes' => 'Corporate event charter',
            ],
        ];

        foreach ($bookings as $booking) {
            if ($booking['client_id'] && $booking['vehicle_id']) {
                Booking::create($booking);
            }
        }
    }
}
