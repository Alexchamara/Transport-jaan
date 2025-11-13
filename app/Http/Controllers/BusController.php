<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BusSchedule;
use App\Models\BusStation;
use App\Models\BusBooking;
use Inertia\Inertia;
use Carbon\Carbon;

class BusController extends Controller
{
    public function search(Request $request)
    {
        $from = $request->input('from');
        $to = $request->input('to');
        $date = $request->input('date');

        // Get stations for dropdown
        $stations = BusStation::where('status', 'active')->get();
        
        $schedules = collect();
        
        if ($from && $to && $date) {
            // Find departure and arrival stations
            $departureStation = BusStation::where('name', $from)->first();
            $arrivalStation = BusStation::where('name', $to)->first();
            
            if ($departureStation && $arrivalStation) {
                $schedules = BusSchedule::with(['bus', 'departureStation', 'arrivalStation'])
                    ->where('departure_station_id', $departureStation->id)
                    ->where('arrival_station_id', $arrivalStation->id)
                    ->where('date', $date)
                    ->where('status', 'active')
                    ->orderBy('departure_time')
                    ->get()
                    ->map(function ($schedule) {
                        return [
                            'id' => $schedule->id,
                            'operator' => $schedule->bus->operator,
                            'busType' => $schedule->bus->bus_type,
                            'routeNo' => $schedule->bus->route_number,
                            'busNo' => $schedule->bus->bus_number,
                            'depart' => $schedule->departure_time->format('g:i A'),
                            'arrive' => $schedule->arrival_time->format('g:i A'),
                            'day' => $schedule->date->format('j M'),
                            'duration' => $schedule->formatted_duration,
                            'price' => $schedule->price,
                            'seatsAvailable' => $schedule->available_seats,
                            'totalSeats' => $schedule->bus->capacity,
                            'expressway' => $schedule->is_expressway,
                            'soldOut' => $schedule->available_seats <= 0,
                            'facilities' => $schedule->bus->facilities ?? [],
                            'departureStation' => $schedule->departureStation->name,
                            'arrivalStation' => $schedule->arrivalStation->name,
                        ];
                    });
            }
        }

        return Inertia::render('Web/home/ticketBooking/BusTicketBookingDetails', [
            'stations' => $stations,
            'schedules' => $schedules,
            'searchParams' => [
                'from' => $from,
                'to' => $to,
                'date' => $date
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:bus_schedules,id',
            'passenger_name' => 'required|string|max:255',
            'passenger_email' => 'required|email|max:255',
            'passenger_phone' => 'required|string|max:20',
            'seat_numbers' => 'required|array',
            'passenger_count' => 'required|integer|min:1',
        ]);

        $schedule = BusSchedule::findOrFail($request->schedule_id);
        
        // Check seat availability
        if ($schedule->available_seats < $request->passenger_count) {
            return back()->withErrors(['seats' => 'Not enough seats available']);
        }

        $totalPrice = $schedule->price * $request->passenger_count;
        
        $booking = BusBooking::create([
            'user_id' => auth()->id(),
            'bus_schedule_id' => $schedule->id,
            'passenger_name' => $request->passenger_name,
            'passenger_email' => $request->passenger_email,
            'passenger_phone' => $request->passenger_phone,
            'seat_numbers' => $request->seat_numbers,
            'passenger_count' => $request->passenger_count,
            'total_price' => $totalPrice,
            'booking_reference' => BusBooking::generateBookingReference(),
            'booking_date' => now(),
            'status' => 'confirmed'
        ]);

        // Update available seats
        $schedule->decrement('available_seats', $request->passenger_count);

        return redirect()->route('bus.booking.success', $booking->booking_reference)
            ->with('success', 'Bus booking confirmed successfully!');
    }

    public function bookingSuccess($reference)
    {
        $booking = BusBooking::with(['busSchedule.bus', 'busSchedule.departureStation', 'busSchedule.arrivalStation'])
            ->where('booking_reference', $reference)
            ->firstOrFail();

        return Inertia::render('Web/home/ticketBooking/BusBookingSuccess', [
            'booking' => $booking
        ]);
    }
}
