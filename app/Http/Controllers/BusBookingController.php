<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BusSchedule;
use App\Models\BusStation;
use App\Models\BusBooking;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class BusBookingController extends Controller
{
    /**
     * Search for bus schedules based on criteria
     */
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
                            'depart' => date('g:i A', strtotime($schedule->departure_time)),
                            'arrive' => date('g:i A', strtotime($schedule->arrival_time)),
                            'day' => date('j M', strtotime($schedule->date)),
                            'duration' => $this->calculateDuration($schedule->departure_time, $schedule->arrival_time),
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

    /**
     * Display the booking preview page with seat selection
     */
    public function preview(Request $request)
    {
        $scheduleId = $request->get('id');
        $searchParams = [
            'from' => $request->get('from'),
            'to' => $request->get('to'),
            'date' => $request->get('date'),
            'passengers' => $request->get('passengers', 1)
        ];

        $schedule = null;
        $tripData = null;

        if ($scheduleId) {
            $schedule = BusSchedule::with(['bus', 'departureStation', 'arrivalStation'])
                ->find($scheduleId);

            if ($schedule) {
                $tripData = [
                    'id' => $schedule->id,
                    'operator' => $schedule->bus->operator,
                    'busType' => $schedule->bus->bus_type,
                    'routeNo' => $schedule->bus->route_number,
                    'busNo' => $schedule->bus->bus_number,
                    'depart' => date('g:i A', strtotime($schedule->departure_time)),
                    'arrive' => date('g:i A', strtotime($schedule->arrival_time)),
                    'day' => date('j M', strtotime($schedule->date)),
                    'duration' => $this->calculateDuration($schedule->departure_time, $schedule->arrival_time),
                    'price' => $schedule->price,
                    'seatsAvailable' => $schedule->available_seats,
                    'totalSeats' => $schedule->bus->capacity,
                    'expressway' => $schedule->is_expressway,
                    'soldOut' => $schedule->available_seats <= 0,
                    'facilities' => $schedule->bus->facilities ?? [],
                    'departureStation' => $schedule->departureStation->name,
                    'arrivalStation' => $schedule->arrivalStation->name,
                ];
            }
        }

        return Inertia::render('Web/home/ticketBooking/BusTicketBookingPreview', [
            'trip' => $tripData,
            'searchParams' => $searchParams
        ]);
    }

    /**
     * Store a new booking
     */
    public function store(Request $request)
    {
        // Handle JSON requests
        if ($request->isJson()) {
            $data = $request->json()->all();
            // Manually set the request values
            foreach ($data as $key => $value) {
                $request->merge([$key => $value]);
            }
        }

        // Log received data for debugging
        \Log::info('Bus booking request data:', $request->all());

        try {
            $validatedData = $request->validate([
                'schedule_id' => 'required|exists:bus_schedules,id',
                'passenger_name' => 'required|string|max:255',
                'passenger_email' => 'nullable|email|max:255',
                'passenger_phone' => 'required|string|max:20',
                'seat_numbers' => 'required',
                'passenger_count' => 'required|integer|min:1',
                'boarding_point' => 'required|string|max:255',
                'destination_point' => 'required|string|max:255'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log validation errors
            \Log::error('Bus booking validation failed:', $e->errors());

            if ($request->expectsJson() || $request->isJson() || $request->ajax()) {
                return response()->json(['errors' => $e->errors()], 422);
            }

            throw $e; // Re-throw for normal form processing
        }

        $schedule = BusSchedule::findOrFail($request->schedule_id);

        // Check seat availability
        if ($schedule->available_seats < $request->passenger_count) {
            return back()->withErrors(['seats' => 'Not enough seats available']);
        }

        $totalPrice = $schedule->price * $request->passenger_count;

        // Parse seat numbers if it's a JSON string
        $seatNumbers = $request->seat_numbers;
        if (is_string($seatNumbers)) {
            $seatNumbers = json_decode($seatNumbers, true);
            // If JSON decode fails, treat it as a comma-separated list
            if ($seatNumbers === null) {
                $seatNumbers = explode(',', $request->seat_numbers);
            }
        }

        // Create the booking (without requiring authentication)
        $bookingData = [
            'user_id' => null, // No user ID required
            'bus_schedule_id' => $schedule->id,
            'passenger_name' => $request->passenger_name,
            'passenger_email' => $request->passenger_email,
            'passenger_phone' => $request->passenger_phone,
            'seat_numbers' => $seatNumbers,
            'passenger_count' => $request->passenger_count,
            'total_price' => $totalPrice,
            'booking_reference' => BusBooking::generateBookingReference(),
            'booking_date' => now(),
            'status' => 'confirmed'
        ];

        // Add user_id only if the user is authenticated
        if (Auth::check()) {
            $bookingData['user_id'] = Auth::id();
        }

        $booking = BusBooking::create($bookingData);

        // Update available seats
        $schedule->decrement('available_seats', $request->passenger_count);

        // Prepare the success response
        $successData = [
            'success' => true,
            'message' => 'Bus booking confirmed successfully!',
            'reference' => $booking->booking_reference,
            'redirect' => route('bus.booking.success', $booking->booking_reference)
        ];

        // For AJAX/JSON requests
        if ($request->ajax() || $request->expectsJson() || $request->wantsJson() || $request->isJson()) {
            return response()->json($successData);
        }

        // For normal form submission
        return redirect()->route('bus.booking.success', $booking->booking_reference)
            ->with('success', 'Bus booking confirmed successfully!');
    }

    /**
     * Display booking success page
     */
    public function bookingSuccess($reference)
    {
        $booking = BusBooking::with(['busSchedule.bus', 'busSchedule.departureStation', 'busSchedule.arrivalStation'])
            ->where('booking_reference', $reference)
            ->firstOrFail();

        return Inertia::render('Web/home/ticketBooking/BusBookingSuccess', [
            'booking' => [
                'reference' => $booking->booking_reference,
                'passengerName' => $booking->passenger_name,
                'passengerEmail' => $booking->passenger_email,
                'passengerPhone' => $booking->passenger_phone,
                'seats' => $booking->seat_numbers,
                'totalPrice' => $booking->total_price,
                'status' => $booking->status,
                'busOperator' => $booking->busSchedule->bus->operator,
                'busNumber' => $booking->busSchedule->bus->bus_number,
                'busType' => $booking->busSchedule->bus->bus_type,
                'departureStation' => $booking->busSchedule->departureStation->name,
                'arrivalStation' => $booking->busSchedule->arrivalStation->name,
                'departureDate' => Carbon::parse($booking->busSchedule->date)->format('j M Y'),
                'departureTime' => Carbon::parse($booking->busSchedule->departure_time)->format('g:i A'),
                'arrivalTime' => Carbon::parse($booking->busSchedule->arrival_time)->format('g:i A'),
            ]
        ]);
    }

    /**
     * Helper function to calculate duration between two times
     */
    private function calculateDuration($departureTime, $arrivalTime)
    {
        $departure = Carbon::parse($departureTime);
        $arrival = Carbon::parse($arrivalTime);

        if ($arrival < $departure) {
            $arrival->addDay();
        }

        $durationMinutes = $departure->diffInMinutes($arrival);
        $hours = floor($durationMinutes / 60);
        $minutes = $durationMinutes % 60;

        return "{$hours}h {$minutes}m";
    }
}
