<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BusSchedule;
use App\Models\BusStation;
use App\Models\BusBooking;
use App\Services\BookingReferenceGenerator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Services\CancellationPolicyService;

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
     * Return ticket booking data as JSON for inline rendering
     */
    public function searchJson(Request $request)
    {
        $stations = BusStation::where('status', 'active')->get();

        return response()->json([
            'stations' => $stations,
            'schedules' => [],
            'searchParams' => [
                'from' => $request->input('from'),
                'to' => $request->input('to'),
                'date' => $request->input('date'),
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
        $bookedSeats = [];
        $seatLayout = null;

        if ($scheduleId) {
            $schedule = BusSchedule::with(['bus', 'departureStation', 'arrivalStation'])
                ->find($scheduleId);

            if ($schedule) {
                // Get all booked seats for this schedule
                $bookedSeats = BusBooking::where('bus_schedule_id', $schedule->id)
                    ->whereIn('status', ['confirmed', 'pending'])
                    ->get()
                    ->pluck('seat_numbers')
                    ->flatten()
                    ->toArray();

                // Get seat layout configuration from bus
                $busCapacity = $schedule->bus->capacity ?? 52;
                $seatLayout = [
                    'rows' => ceil($busCapacity / 4), // 4 seats per row (2+2)
                    'columns' => 4,
                    'totalSeats' => $busCapacity,
                    'aisle' => 2, // Aisle after 2nd column
                ];

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
            'searchParams' => $searchParams,
            'bookedSeats' => $bookedSeats,
            'seatLayout' => $seatLayout,
        ]);
    }

    /**
     * Store a new booking with race condition protection
     */
    public function store(Request $request)
    {
        // Check if the user is logged in
        if (!Auth::check()) {
            return redirect()->route('signin.signin')->with('message', 'Please log in to make a booking.');
        }

        // Handle JSON requests
        if ($request->isJson()) {
            $data = $request->json()->all();
            // Manually set the request values
            foreach ($data as $key => $value) {
                $request->merge([$key => $value]);
            }
        }

        // Log received data for debugging
        Log::info('Bus booking request data:', $request->all());

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
        } catch (ValidationException $e) {
            // Log validation errors
            Log::error('Bus booking validation failed:', $e->errors());

            if ($request->expectsJson() || $request->isJson() || $request->ajax()) {
                return response()->json(['errors' => $e->errors()], 422);
            }

            throw $e; // Re-throw for normal form processing
        }

        // Parse seat numbers early for validation
        $seatNumbers = $request->seat_numbers;
        if (is_string($seatNumbers)) {
            $seatNumbers = json_decode($seatNumbers, true);
            // If JSON decode fails, treat it as a comma-separated list
            if ($seatNumbers === null) {
                $seatNumbers = explode(',', $request->seat_numbers);
            }
        }
        // Clean up seat numbers array
        $seatNumbers = array_map('trim', $seatNumbers);
        $seatNumbers = array_values(array_filter($seatNumbers));

        try {
            // Use database transaction with row locking to prevent race conditions
            $booking = DB::transaction(function () use ($request, $seatNumbers) {
                // Lock the schedule row for update to prevent concurrent modifications
                $schedule = BusSchedule::where('id', $request->schedule_id)
                    ->lockForUpdate()
                    ->first();

                if (!$schedule) {
                    throw ValidationException::withMessages([
                        'schedule' => ['Schedule not found.']
                    ]);
                }

                // Check if schedule is active
                if ($schedule->status !== 'active') {
                    throw ValidationException::withMessages([
                        'schedule' => ['This schedule is not currently available for booking.']
                    ]);
                }

                // Check if booking date is not in the past
                if (Carbon::parse($schedule->date)->isPast()) {
                    throw ValidationException::withMessages([
                        'schedule' => ['Cannot book a schedule in the past.']
                    ]);
                }

                // Check seat availability (atomic check within transaction)
                if ($schedule->available_seats < $request->passenger_count) {
                    throw ValidationException::withMessages([
                        'seats' => ["Only {$schedule->available_seats} seat(s) available. You requested {$request->passenger_count}"]
                    ]);
                }

                // Check for seat collision - verify requested seats aren't already booked
                $bookedSeats = BusBooking::where('bus_schedule_id', $schedule->id)
                    ->whereIn('status', ['confirmed', 'pending'])
                    ->get()
                    ->pluck('seat_numbers')
                    ->flatten()
                    ->toArray();

                $conflicts = array_intersect($seatNumbers, $bookedSeats);
                if (!empty($conflicts)) {
                    throw ValidationException::withMessages([
                        'seats' => ['The following seats are already booked: ' . implode(', ', $conflicts) . '. Please select different seats.']
                    ]);
                }

                // Validate seat count matches requested seats
                if (count($seatNumbers) !== $request->passenger_count) {
                    throw ValidationException::withMessages([
                        'seats' => ['Number of selected seats must match passenger count.']
                    ]);
                }

                // Check that seats don't exceed bus capacity
                $busCapacity = $schedule->bus->capacity ?? 50;
                foreach ($seatNumbers as $seatNum) {
                    if (is_numeric($seatNum) && $seatNum > $busCapacity) {
                        throw ValidationException::withMessages([
                            'seats' => ['Invalid seat number: ' . $seatNum . '. Bus capacity is ' . $busCapacity]
                        ]);
                    }
                }

                // Calculate total price from database (never trust client-side calculations)
                $totalPrice = $schedule->price * $request->passenger_count;

                // Create the booking
                $bookingData = [
                    'user_id' => Auth::check() ? Auth::id() : null,
                    'bus_schedule_id' => $schedule->id,
                    'passenger_name' => $request->passenger_name,
                    'passenger_email' => $request->passenger_email,
                    'passenger_phone' => $request->passenger_phone,
                    'seat_numbers' => $seatNumbers,
                    'passenger_count' => $request->passenger_count,
                    'total_price' => $totalPrice,
                    'booking_reference' => BusBooking::generateBookingReference(),
                    'booking_date' => now(),
                    'status' => 'pending', // Start as pending until payment
                    'payment_status' => 'pending',
                    'expires_at' => now()->addMinutes(15) // Booking expires in 15 minutes
                ];

                $booking = BusBooking::create($bookingData);

                // Atomically decrement available seats
                $schedule->decrement('available_seats', $request->passenger_count);

                Log::info('Bus booking created successfully', [
                    'booking_id' => $booking->id,
                    'reference' => $booking->booking_reference,
                    'seats_remaining' => $schedule->fresh()->available_seats
                ]);

                return $booking;
            });

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

        } catch (ValidationException $e) {
            Log::warning('Bus booking validation failed within transaction', ['errors' => $e->errors()]);
            
            if ($request->ajax() || $request->expectsJson() || $request->wantsJson() || $request->isJson()) {
                return response()->json(['errors' => $e->errors()], 422);
            }
            
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Bus booking failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $errorMessage = 'An error occurred while processing your booking. Please try again.';

            if ($request->ajax() || $request->expectsJson() || $request->wantsJson() || $request->isJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $errorMessage
                ], 500);
            }

            return back()->withErrors(['error' => $errorMessage])->withInput();
        }
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
     * Download ticket as PDF
     */
    public function downloadTicket($reference)
    {
        // Check if user is logged in
        if (!Auth::check()) {
            return redirect()->route('signin')->with('message', 'Please log in to download your ticket.');
        }

        $booking = BusBooking::with(['busSchedule.bus', 'busSchedule.departureStation', 'busSchedule.arrivalStation', 'user'])
            ->where('booking_reference', $reference)
            ->firstOrFail();

        // Verify ownership
        if ($booking->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to ticket.');
        }

        try {
            $ticketService = app(\App\Services\TicketGenerationService::class);
            $result = $ticketService->generateBusTicket($booking);

            return response()->download($result['path'], "{$reference}.pdf", [
                'Content-Type' => 'application/pdf',
            ]);
        } catch (\Exception $e) {
            Log::error('Ticket download failed', [
                'reference' => $reference,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Failed to generate ticket. Please try again.']);
        }
    }

    /**
     * View ticket in browser
     */
    public function viewTicket($reference)
    {
        // Check if user is logged in
        if (!Auth::check()) {
            return redirect()->route('signin')->with('message', 'Please log in to view your ticket.');
        }

        $booking = BusBooking::with(['busSchedule.bus', 'busSchedule.departureStation', 'busSchedule.arrivalStation', 'user'])
            ->where('booking_reference', $reference)
            ->firstOrFail();

        // Verify ownership
        if ($booking->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to ticket.');
        }

        try {
            $ticketService = app(\App\Services\TicketGenerationService::class);
            $result = $ticketService->generateBusTicket($booking);

            return response()->file($result['path'], [
                'Content-Type' => 'application/pdf',
            ]);
        } catch (\Exception $e) {
            Log::error('Ticket view failed', [
                'reference' => $reference,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Failed to generate ticket. Please try again.']);
        }
    }

    /**
     * Email ticket to customer
     */
    public function emailTicket($reference)
    {
        // Check if user is logged in
        if (!Auth::check()) {
            if (request()->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Please log in.'], 401);
            }
            return redirect()->route('signin')->with('message', 'Please log in to email your ticket.');
        }

        $booking = BusBooking::with(['busSchedule.bus', 'busSchedule.departureStation', 'busSchedule.arrivalStation', 'user'])
            ->where('booking_reference', $reference)
            ->firstOrFail();

        // Verify ownership
        if ($booking->user_id !== Auth::id()) {
            if (request()->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }
            abort(403, 'Unauthorized access to ticket.');
        }

        try {
            $ticketService = app(\App\Services\TicketGenerationService::class);
            $result = $ticketService->generateBusTicket($booking);

            // Send email with ticket attachment
            $email = $booking->passenger_email ?? $booking->user->email;
            
            if (!$email) {
                throw new \Exception('No email address available for this booking.');
            }

            Mail::send('emails.ticket', [
                'booking' => $booking,
                'reference' => $reference
            ], function ($message) use ($email, $result, $reference) {
                $message->to($email)
                    ->subject('Your Bus Ticket - ' . $reference)
                    ->attach($result['path'], [
                        'as' => $reference . '.pdf',
                        'mime' => 'application/pdf',
                    ]);
            });

            Log::info('Ticket emailed successfully', [
                'reference' => $reference,
                'email' => $email
            ]);

            if (request()->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Ticket has been sent to ' . $email
                ]);
            }

            return back()->with('success', 'Ticket has been sent to ' . $email);

        } catch (\Exception $e) {
            Log::error('Ticket email failed', [
                'reference' => $reference,
                'error' => $e->getMessage()
            ]);

            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to email ticket. Please try again.'
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to email ticket. Please try again.']);
        }
    }

    /**
     * Get cancellation policy details for a booking
     */
    public function getCancellationPolicy($reference)
    {
        // Check if user is logged in
        if (!Auth::check()) {
            if (request()->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Please log in.'], 401);
            }
            return redirect()->route('signin')->with('message', 'Please log in to view cancellation policy.');
        }

        $booking = BusBooking::with(['busSchedule'])
            ->where('booking_reference', $reference)
            ->firstOrFail();

        // Verify ownership
        if ($booking->user_id !== Auth::id()) {
            if (request()->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }
            abort(403, 'Unauthorized access.');
        }

        try {
            $cancellationService = app(CancellationPolicyService::class);
            
            // Check if booking can be cancelled
            if (!$cancellationService->canCancel('bus', $booking)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This booking cannot be cancelled.',
                    'can_cancel' => false
                ]);
            }

            // Calculate refund details
            $refundDetails = $cancellationService->calculateRefund('bus', $booking);

            return response()->json([
                'success' => true,
                'can_cancel' => true,
                'refund_details' => $refundDetails
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get cancellation policy', [
                'reference' => $reference,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve cancellation policy.'
            ], 500);
        }
    }

    /**
     * Cancel a bus booking
     */
    public function cancelBooking(Request $request, $reference)
    {
        // Check if user is logged in
        if (!Auth::check()) {
            if (request()->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Please log in.'], 401);
            }
            return redirect()->route('signin')->with('message', 'Please log in to cancel your booking.');
        }

        $booking = BusBooking::where('booking_reference', $reference)->firstOrFail();

        // Verify ownership
        if ($booking->user_id !== Auth::id()) {
            if (request()->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }
            abort(403, 'Unauthorized access.');
        }

        // Validate request
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500'
        ]);

        try {
            $cancellationService = app(CancellationPolicyService::class);
            
            $result = $cancellationService->cancelBooking(
                'bus',
                $reference,
                Auth::id(),
                $validated['reason'] ?? null
            );

            if ($result['success']) {
                Log::info('Bus booking cancelled successfully', [
                    'reference' => $reference,
                    'user_id' => Auth::id()
                ]);

                if (request()->expectsJson()) {
                    return response()->json($result);
                }

                return redirect()->route('dashboard')
                    ->with('success', $result['message']);
            } else {
                if (request()->expectsJson()) {
                    return response()->json($result, 400);
                }

                return back()->withErrors(['error' => $result['message']]);
            }

        } catch (\Exception $e) {
            Log::error('Bus booking cancellation failed', [
                'reference' => $reference,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to cancel booking. Please try again.'
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to cancel booking. Please try again.']);
        }
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
