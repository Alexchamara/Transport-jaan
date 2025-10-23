<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFlightBookingRequest;
use App\Mail\FlightBookingConfirmation;
use App\Models\FlightBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class FlightBookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $bookings = FlightBooking::latest()->paginate(10);
        return response()->json($bookings);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // This would return the flight booking form view
        // For API, this might not be needed
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFlightBookingRequest $request)
    {
        // Check if the user is logged in
        if (!auth()->check()) {
            return redirect()->route('signin.signin')->with('message', 'Please log in to make a booking.');
        }

        try {
            // Associate the booking with the authenticated user
            $data = $request->validated();
            $data['user_id'] = auth()->id();

            $flightBooking = FlightBooking::create($data);

            // Send confirmation email
            try {
                Mail::to($flightBooking->email)->send(new FlightBookingConfirmation($flightBooking));
            } catch (\Exception $e) {
                Log::warning('Failed to send flight booking confirmation email: ' . $e->getMessage());
            }

            return back()->with('success', 'Your flight booking request has been submitted successfully! We will contact you shortly.');

        } catch (\Exception $e) {
            Log::error('Flight Booking Submission Error: ' . $e->getMessage());

            return back()->with('error', 'There was an error submitting your flight booking. Please try again or contact support.')
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(FlightBooking $flightBooking)
    {
        return response()->json($flightBooking);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FlightBooking $flightBooking)
    {
        return response()->json($flightBooking);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, FlightBooking $flightBooking)
    {
        $validatedData = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);

        $flightBooking->update($validatedData);

        return response()->json([
            'message' => 'Flight booking updated successfully.',
            'data' => $flightBooking
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FlightBooking $flightBooking)
    {
        $flightBooking->delete();

        return response()->json([
            'message' => 'Flight booking deleted successfully.'
        ]);
    }
}
