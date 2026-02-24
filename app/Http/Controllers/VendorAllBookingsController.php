<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\FlightBooking;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class VendorAllBookingsController extends Controller
{
    public function index()
    {
        $vendorId = Auth::id();
        $vendor = Auth::user();
        
        // Only allow vendors to access this
        if ($vendor->role !== 'vendor') {
            abort(403, 'Unauthorized access');
        }

        // Fetch vehicle bookings where vendor is the provider
        $vehicleBookings = Booking::whereHas('vehicle', function($q) use ($vendorId) {
            $q->where('provider_id', $vendorId);
        })
            ->with(['vehicle.provider', 'client', 'customer', 'schedule', 'payments'])
            ->get()
            ->map(function($booking) {
                $vehicle = $booking->vehicle;
                $client = $booking->client;
                $customer = $booking->customer;
                $schedule = $booking->schedule;
                
                return [
                    'id' => $booking->id,
                    'booking_type' => 'vehicle',
                    'service_name' => $vehicle->name ?? 'Vehicle Rental',
                    'vehicle_name' => $vehicle->name ?? null,
                    'vehicle_category' => $vehicle->category ?? null,
                    'status' => $booking->status,
                    'total_amount' => $booking->total_amount,
                    'amount' => $booking->total_amount,
                    'booking_date' => $booking->created_at->format('Y-m-d'),
                    'start_date' => $booking->start_date,
                    'end_date' => $booking->end_date,
                    'pickup_location' => $schedule->pickup_location ?? null,
                    'dropoff_location' => $schedule->dropoff_location ?? null,
                    'booking_code' => $booking->booking_code ?? 'BK-' . $booking->id,
                    'reference_number' => $booking->booking_code ?? 'REF-' . $booking->id,
                    'currency' => $booking->currency ?? 'LKR',
                    'created_at' => $booking->created_at,
                    
                    // Client Information
                    'customer_name' => $customer->name ?? $client->name ?? null,
                    'customer_email' => $customer->email ?? $client->email ?? null,
                    'customer_phone' => $customer->phone ?? $client->phone ?? null,
                    'customer_address' => $customer->address ?? $client->address ?? null,
                    
                    // Payment Information
                    'payment_method' => $booking->payments->first()->payment_method ?? 'Not specified',
                    'payment_status' => $booking->payments->first()->status ?? $booking->status,
                    
                    // Additional Details
                    'notes' => $booking->notes,
                    'subtotal' => $booking->subtotal,
                    'deposit_amount' => $booking->deposit_amount,
                    'price_per_day' => $booking->price_per_day,
                    'rental_days' => $booking->rental_days,
                ];
            });

        // Fetch flight bookings for this vendor
        $flightBookings = FlightBooking::where('user_id', $vendorId)
            ->with(['user'])
            ->get()
            ->map(function($booking) {
                return [
                    'id' => $booking->id,
                    'booking_type' => 'flight',
                    'service_name' => 'Flight Ticket',
                    'status' => $booking->status,
                    'booking_date' => $booking->created_at->format('Y-m-d'),
                    'start_date' => $booking->departure_date,
                    'end_date' => $booking->return_date,
                    'pickup_location' => $booking->departure_airport,
                    'dropoff_location' => $booking->arriving_airport,
                    'reference_number' => 'FL-' . $booking->id,
                    'booking_code' => 'FL-' . $booking->id,
                    'currency' => 'LKR',
                    'created_at' => $booking->created_at,
                    'customer_name' => $booking->name,
                    'customer_email' => $booking->email,
                    'customer_phone' => $booking->phone,
                    'total_amount' => $booking->total_amount ?? 0,
                    'amount' => $booking->total_amount ?? 0,
                    'notes' => "Trip: {$booking->trip_type}",
                ];
            });

        // Combine all bookings
        $allBookings = collect($vehicleBookings)
            ->merge($flightBookings)
            ->sortByDesc('created_at')
            ->values();

        // Calculate statistics
        $statistics = [
            'total_bookings' => $allBookings->count(),
            'active_bookings' => $allBookings->whereIn('status', ['confirmed', 'paid', 'active'])->count(),
            'total_earned' => $allBookings->sum('total_amount'),
            'this_month' => $allBookings->filter(function($b) {
                return Carbon::parse($b['created_at'])->isCurrentMonth();
            })->count(),
        ];

        // Monthly data for charts
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthBookings = $allBookings->filter(function($b) use ($month) {
                return Carbon::parse($b['created_at'])->isSameMonth($month);
            });
            
            $monthlyData[] = [
                'month' => $month->format('M'),
                'vehicle' => $monthBookings->where('booking_type', 'vehicle')->count(),
                'flight' => $monthBookings->where('booking_type', 'flight')->count(),
            ];
        }

        return Inertia::render('Web/home/vendors/AllBookingsDashboard', [
            'allBookings' => $allBookings,
            'statistics' => $statistics,
            'monthlyData' => $monthlyData,
        ]);
    }

    public function calendar()
    {
        $vendorId = Auth::id();
        $vendor = Auth::user();
        
        // Only allow vendors to access this
        if ($vendor->role !== 'vendor') {
            abort(403, 'Unauthorized access');
        }

        // Fetch vehicle bookings where vendor is the provider
        $vehicleBookings = Booking::whereHas('vehicle', function($q) use ($vendorId) {
            $q->where('provider_id', $vendorId);
        })
            ->with(['vehicle.provider', 'client', 'customer', 'schedule', 'payments'])
            ->get()
            ->map(function($booking) {
                $vehicle = $booking->vehicle;
                $client = $booking->client;
                $customer = $booking->customer;
                $schedule = $booking->schedule;
                
                return [
                    'id' => $booking->id,
                    'booking_type' => 'vehicle',
                    'service_name' => $vehicle->name ?? 'Vehicle Rental',
                    'vehicle_name' => $vehicle->name ?? null,
                    'vehicle_category' => $vehicle->category ?? null,
                    'status' => $booking->status,
                    'total_amount' => $booking->total_amount,
                    'amount' => $booking->total_amount,
                    'booking_date' => $booking->created_at->format('Y-m-d'),
                    'start_date' => $booking->start_date,
                    'end_date' => $booking->end_date,
                    'pickup_location' => $schedule->pickup_location ?? null,
                    'dropoff_location' => $schedule->dropoff_location ?? null,
                    'booking_code' => $booking->booking_code ?? 'BK-' . $booking->id,
                    'reference_number' => $booking->booking_code ?? 'REF-' . $booking->id,
                    'customer_name' => ($customer->first_name ?? '') . ' ' . ($customer->last_name ?? '') ?? 'N/A',
                    'created_at' => $booking->created_at->format('Y-m-d'),
                ];
            });

        // Fetch flight bookings as vendor
        $flightBookings = FlightBooking::where('user_id', $vendorId)
            ->with(['flight', 'client', 'customer', 'payments'])
            ->get()
            ->map(function($booking) {
                $flight = $booking->flight;
                $customer = $booking->customer;
                
                return [
                    'id' => $booking->id,
                    'booking_type' => 'flight',
                    'service_name' => 'Flight Booking',
                    'flight_number' => $flight->flight_number ?? null,
                    'airline' => $flight->airline ?? null,
                    'status' => $booking->status,
                    'total_amount' => $booking->total_amount,
                    'amount' => $booking->total_amount,
                    'booking_date' => $booking->created_at->format('Y-m-d'),
                    'departure_date' => $flight->departure_date ?? null,
                    'arrival_date' => $flight->arrival_date ?? null,
                    'booking_code' => $booking->booking_code ?? 'FB-' . $booking->id,
                    'reference_number' => $booking->booking_code ?? 'REF-' . $booking->id,
                    'customer_name' => ($customer->first_name ?? '') . ' ' . ($customer->last_name ?? '') ?? 'N/A',
                    'created_at' => $booking->created_at->format('Y-m-d'),
                ];
            });

        $allBookings = $vehicleBookings->concat($flightBookings)->sortByDesc('created_at')->values();

        // Calculate statistics
        $statistics = [
            'total_bookings' => $allBookings->count(),
            'active_bookings' => $allBookings->whereIn('status', ['Pending', 'Confirmed', 'Active'])->count(),
            'total_earned' => $allBookings->sum('total_amount'),
            'this_month' => 0
        ];

        return Inertia::render('Web/home/vendors/allBookings/CalendarPage', [
            'allBookings' => $allBookings,
            'statistics' => $statistics,
        ]);
    }

    public function clients()
    {
        $vendorId = Auth::id();
        $vendor = Auth::user();

        if ($vendor->role !== 'vendor') {
            abort(403, 'Unauthorized access');
        }

        // Fetch vehicle bookings for this vendor
        $vehicleBookings = Booking::whereHas('vehicle', function($q) use ($vendorId) {
            $q->where('provider_id', $vendorId);
        })
            ->with(['vehicle', 'client', 'customer', 'schedule', 'payments'])
            ->get()
            ->map(function($booking) {
                $vehicle  = $booking->vehicle;
                $client   = $booking->client;
                $customer = $booking->customer;
                $schedule = $booking->schedule;

                return [
                    'id'               => $booking->id,
                    'booking_type'     => 'vehicle',
                    'service_name'     => $vehicle->name ?? 'Vehicle Rental',
                    'status'           => $booking->status,
                    'total_amount'     => $booking->total_amount,
                    'booking_date'     => $booking->created_at->format('Y-m-d'),
                    'booking_code'     => $booking->booking_code ?? 'BK-' . $booking->id,
                    'currency'         => $booking->currency ?? 'LKR',
                    'created_at'       => $booking->created_at,
                    'customer_name'    => $customer->name ?? $client->name ?? 'N/A',
                    'customer_email'   => $customer->email ?? $client->email ?? 'N/A',
                    'customer_phone'   => $customer->phone ?? $client->phone ?? 'N/A',
                    'customer_address' => $customer->address ?? $client->address ?? '',
                ];
            });

        // Fetch flight bookings for this vendor
        $flightBookings = FlightBooking::where('user_id', $vendorId)
            ->with(['user'])
            ->get()
            ->map(function($booking) {
                return [
                    'id'               => $booking->id,
                    'booking_type'     => 'flight',
                    'service_name'     => 'Flight Ticket',
                    'status'           => $booking->status,
                    'total_amount'     => $booking->total_amount ?? 0,
                    'booking_date'     => $booking->created_at->format('Y-m-d'),
                    'booking_code'     => 'FL-' . $booking->id,
                    'currency'         => 'LKR',
                    'created_at'       => $booking->created_at,
                    'customer_name'    => $booking->name ?? 'N/A',
                    'customer_email'   => $booking->email ?? 'N/A',
                    'customer_phone'   => $booking->phone ?? 'N/A',
                    'customer_address' => '',
                ];
            });

        $allBookings = collect($vehicleBookings)
            ->merge($flightBookings)
            ->sortByDesc('created_at')
            ->values();

        $statistics = [
            'total_bookings'  => $allBookings->count(),
            'active_bookings' => $allBookings->whereIn('status', ['confirmed', 'paid', 'active'])->count(),
            'total_earned'    => $allBookings->sum('total_amount'),
        ];

        return Inertia::render('Web/home/vendors/allBookings/AllClient', [
            'allBookings' => $allBookings,
            'statistics'  => $statistics,
        ]);
    }

    public function bookings()
    {
        $vendorId = Auth::id();
        $vendor   = Auth::user();

        if ($vendor->role !== 'vendor') {
            abort(403, 'Unauthorized access');
        }

        // ── Vehicle bookings ──────────────────────────────────────────────────
        $vehicleBookings = Booking::whereHas('vehicle', function ($q) use ($vendorId) {
            $q->where('provider_id', $vendorId);
        })
            ->with(['vehicle', 'client', 'customer', 'schedule', 'payments'])
            ->get()
            ->map(function ($booking) {
                $vehicle  = $booking->vehicle;
                $customer = $booking->customer;
                $client   = $booking->client;
                $schedule = $booking->schedule;

                return [
                    'id'            => $booking->id,
                    'booking_type'  => 'vehicle',
                    'service_name'  => $vehicle->name ?? 'Vehicle Rental',
                    'status'        => $booking->status,
                    'payment_status'=> $booking->payments->first()?->status ?? 'Pending',
                    'total_amount'  => $booking->total_amount,
                    'booking_date'  => $booking->created_at->format('Y-m-d'),
                    'start_date'    => $booking->start_date ?? null,
                    'end_date'      => $booking->end_date ?? null,
                    'booking_code'  => $booking->booking_code ?? 'BK-' . $booking->id,
                    'customer_name' => $customer->name ?? $client->name ?? 'N/A',
                    'customer_email'=> $customer->email ?? $client->email ?? 'N/A',
                    'customer_phone'=> $customer->phone ?? $client->phone ?? 'N/A',
                    'pickup_location'  => $schedule->pickup_location ?? null,
                    'dropoff_location' => $schedule->dropoff_location ?? null,
                    'created_at'    => $booking->created_at,
                ];
            });

        // ── Flight bookings ───────────────────────────────────────────────────
        $flightBookings = FlightBooking::where('user_id', $vendorId)
            ->with(['user'])
            ->get()
            ->map(function ($booking) {
                return [
                    'id'            => $booking->id,
                    'booking_type'  => 'flight',
                    'service_name'  => 'Flight Ticket',
                    'status'        => $booking->status,
                    'payment_status'=> $booking->payment_status ?? 'Pending',
                    'total_amount'  => $booking->total_amount ?? 0,
                    'booking_date'  => $booking->created_at->format('Y-m-d'),
                    'start_date'    => $booking->departure_date ?? null,
                    'end_date'      => $booking->return_date ?? null,
                    'booking_code'  => 'FL-' . $booking->id,
                    'customer_name' => $booking->name ?? 'N/A',
                    'customer_email'=> $booking->email ?? 'N/A',
                    'customer_phone'=> $booking->phone ?? 'N/A',
                    'pickup_location'  => $booking->departure_airport ?? null,
                    'dropoff_location' => $booking->arriving_airport ?? null,
                    'created_at'    => $booking->created_at,
                ];
            });

        $allBookings = collect($vehicleBookings)
            ->merge($flightBookings)
            ->sortByDesc('created_at')
            ->values();

        $today = Carbon::today();

        $bookingStats = [
            'upcoming'  => $allBookings->filter(fn($b) =>
                isset($b['start_date']) &&
                Carbon::parse($b['start_date'])->gt($today) &&
                !in_array(strtolower($b['status']), ['cancelled', 'completed'])
            )->count(),
            'pending'   => $allBookings->filter(fn($b) =>
                strtolower($b['status']) === 'pending'
            )->count(),
            'cancelled' => $allBookings->filter(fn($b) =>
                strtolower($b['status']) === 'cancelled'
            )->count(),
            'completed' => $allBookings->filter(fn($b) =>
                in_array(strtolower($b['status']), ['completed', 'returned'])
            )->count(),
        ];

        return Inertia::render('Web/home/vendors/allBookings/BookingPage', [
            'allBookings'  => $allBookings,
            'bookingStats' => $bookingStats,
        ]);
    }
}
