<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\FlightBooking;
use App\Models\FreightQuote;
use App\Models\Booking;
use App\Models\BusBooking;
use App\Models\TrainBooking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class UserDashboardController extends Controller
{
    public function view()
    {
        return Inertia::render('Web/dashboard/View');
    }    public function flightView()
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

    public function ticketBookingDashboard()
    {
        $userId = Auth::id();
        
        // Fetch bus bookings
        $busBookings = BusBooking::with(['busSchedule.bus', 'busSchedule.departureStation', 'busSchedule.arrivalStation'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($booking) {
                $schedule = $booking->busSchedule;
                return [
                    'id' => $booking->id,
                    'reference' => $booking->booking_reference,
                    'type' => 'bus',
                    'mode' => 'bus',
                    'name' => $schedule->bus->operator . ' - ' . $schedule->bus->bus_number,
                    'from' => $schedule->departureStation->name,
                    'to' => $schedule->arrivalStation->name,
                    'departure_date' => Carbon::parse($schedule->date)->format('Y-m-d'),
                    'departure_time' => Carbon::parse($schedule->departure_time)->format('H:i'),
                    'arrival_time' => Carbon::parse($schedule->arrival_time)->format('H:i'),
                    'seats' => $booking->seat_numbers,
                    'passenger_count' => $booking->passenger_count,
                    'total_price' => $booking->total_price,
                    'status' => $booking->status,
                    'payment_status' => $booking->payment_status,
                    'booking_date' => $booking->booking_date ? Carbon::parse($booking->booking_date)->format('Y-m-d H:i') : $booking->created_at->format('Y-m-d H:i'),
                    'cancelled_at' => $booking->cancelled_at,
                    'cancellation_reason' => $booking->cancellation_reason,
                    'refund_amount' => $booking->refund_amount,
                    'cancellation_fee' => $booking->cancellation_fee,
                ];
            });

        // Fetch train bookings
        $trainBookings = TrainBooking::with(['trainSchedule.train', 'trainSchedule.departureStation', 'trainSchedule.arrivalStation'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($booking) {
                $schedule = $booking->trainSchedule;
                return [
                    'id' => $booking->id,
                    'reference' => $booking->booking_reference,
                    'type' => 'train',
                    'mode' => 'train',
                    'name' => $schedule->train->name . ' - ' . $schedule->train->train_number,
                    'from' => $schedule->departureStation->name,
                    'to' => $schedule->arrivalStation->name,
                    'departure_date' => Carbon::parse($schedule->departure_date)->format('Y-m-d'),
                    'departure_time' => Carbon::parse($schedule->departure_time)->format('H:i'),
                    'arrival_time' => Carbon::parse($schedule->arrival_time)->format('H:i'),
                    'seats' => $booking->seat_numbers,
                    'passenger_count' => $booking->total_passengers,
                    'total_price' => $booking->total_amount,
                    'status' => $booking->status,
                    'payment_status' => $booking->payment_status,
                    'booking_date' => $booking->created_at->format('Y-m-d H:i'),
                    'cancelled_at' => $booking->cancelled_at,
                    'cancellation_reason' => $booking->cancellation_reason,
                    'refund_amount' => $booking->refund_amount,
                    'cancellation_fee' => $booking->cancellation_fee,
                ];
            });

        // Fetch flight bookings
        $flightBookings = FlightBooking::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($booking) {
                return [
                    'id' => $booking->id,
                    'reference' => 'FL-' . $booking->id,
                    'type' => 'flight',
                    'mode' => 'flight',
                    'name' => $booking->subject ?? 'Flight Booking',
                    'from' => $booking->departure_airport,
                    'to' => $booking->arriving_airport,
                    'departure_date' => $booking->departure_date ? Carbon::parse($booking->departure_date)->format('Y-m-d') : null,
                    'return_date' => $booking->return_date ? Carbon::parse($booking->return_date)->format('Y-m-d') : null,
                    'trip_type' => $booking->trip_type,
                    'status' => $booking->status,
                    'booking_date' => $booking->created_at->format('Y-m-d H:i'),
                    'cancelled_at' => $booking->cancelled_at,
                    'cancellation_reason' => $booking->cancellation_reason,
                    'refund_amount' => $booking->refund_amount,
                    'cancellation_fee' => $booking->cancellation_fee,
                ];
            });

        // Combine all bookings
        $allBookings = collect([])
            ->concat($busBookings)
            ->concat($trainBookings)
            ->concat($flightBookings)
            ->sortByDesc('booking_date')
            ->values();

        // Calculate monthly data for charts
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthBookings = $allBookings->filter(function($b) use ($month) {
                return Carbon::parse($b['booking_date'])->isSameMonth($month);
            });
            
            $monthlyData[] = [
                'month' => $month->format('M'),
                'flight' => $monthBookings->where('mode', 'flight')->count(),
                'train' => $monthBookings->where('mode', 'train')->count(),
                'bus' => $monthBookings->where('mode', 'bus')->count(),
            ];
        }

        return Inertia::render('Web/home/client/ClientTicketBookingDashboard', [
            'bookings' => $allBookings,
            'monthlyData' => $monthlyData,
        ]);
    }
}
