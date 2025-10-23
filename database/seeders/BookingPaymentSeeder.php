<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\BookingPayment;

class BookingPaymentSeeder extends Seeder
{
    public function run(): void
    {
        $bookings = Booking::limit(2)->get();

        foreach ($bookings as $index => $booking) {
            BookingPayment::create([
                'booking_id' => $booking->id,
                'method' => $index === 0 ? 'Credit Card' : 'Bank Transfer',
                'option' => $index === 0 ? 'full' : 'advance',
                'amount_paid' => $index === 0 ? $booking->total_amount : $booking->advance_amount,
                'status' => $index === 0 ? 'paid' : 'pending',
                'slip_number' => $index === 1 ? 'SLIP-' . str_pad($booking->id, 8, '0', STR_PAD_LEFT) : null,
                'slip_path' => $index === 1 ? 'payments/slips/' . $booking->id . '_slip.jpg' : null,
                'tx_reference' => $index === 0 ? 'TXN-' . strtoupper(uniqid()) : null,
            ]);
        }
    }
}
