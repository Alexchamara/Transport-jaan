<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\FlightBooking;
use App\Models\FreightQuote;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserDashboardController extends Controller
{
    public function view()
    {
        return Inertia::render('Web/dashboard/View');
    }

    public function flightView()
    {
        $flights = FlightBooking::where('user_id', auth()->id())->get();
        return Inertia::render('Web/dashboard/FlightView', [
            'flights' => $flights
        ]);
    }

    public function bookingView()
    {
        $bookings = FlightBooking::where('user_id', auth()->id())->get();
        return Inertia::render('Web/dashboard/BookingView', [
            'bookings' => $bookings,
            'flights' => []
        ]);
    }

    public function freightBookings()
    {
        $freightBookings = FreightQuote::where('user_id', auth()->id())->get();
        return Inertia::render('Web/dashboard/FreightBookings', [
            'bookings' => $freightBookings
        ]);
    }

    public function airticketBook()
    {
        return Inertia::render('Web/dashboard/AirticketBook');
    }

    public function airticketBookView()
    {
        return Inertia::render('Web/dashboard/AirticketBookView');
    }

    public function destroy($id)
    {
        $booking = FlightBooking::where('user_id', auth()->id())->findOrFail($id);
        $booking->delete();

        return redirect()->route('user.booking_view')->with('success', 'Booking deleted successfully.');
    }
}
