<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\AirVehicleBookings;
use App\Models\SeaVehicleBookings;
use App\Models\FlightBooking;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\User;

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

        $resolveCustomerName = static function ($customer, $client): string {
            $fullName = trim((string) data_get($customer, 'full_name'));
            if ($fullName !== '') {
                return $fullName;
            }

            $combinedName = trim(
                trim((string) data_get($customer, 'first_name'))
                . ' ' .
                trim((string) data_get($customer, 'last_name'))
            );
            if ($combinedName !== '') {
                return $combinedName;
            }

            $customerName = trim((string) data_get($customer, 'name'));
            if ($customerName !== '') {
                return $customerName;
            }

            $clientName = trim((string) data_get($client, 'name'));
            if ($clientName !== '') {
                return $clientName;
            }

            $clientFullName = trim((string) data_get($client, 'full_name'));
            if ($clientFullName !== '') {
                return $clientFullName;
            }

            return 'N/A';
        };

        // Fetch land vehicle bookings where vendor is the provider
        $landVehicleBookings = Booking::whereHas('vehicle', function($q) use ($vendorId) {
            $q->where('provider_id', $vendorId);
        })
            ->with(['vehicle.provider', 'client', 'customer', 'schedule', 'payments'])
            ->get()
            ->map(function($booking) use ($resolveCustomerName) {
                $vehicle = $booking->vehicle;
                $client = $booking->client;
                $customer = $booking->customer;
                $schedule = $booking->schedule;
                
                return [
                    'id' => 'BKG-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT),
                    'booking_type' => 'vehicle',
                    'service_name' => 'Vehicle Rental',
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
                    'customer_name' => $resolveCustomerName($customer, $client),
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

        // Fetch air vehicle bookings where vendor is the provider
        $airVehicleBookings = AirVehicleBookings::whereHas('vehicle', function($q) use ($vendorId) {
            $q->where('provider_id', $vendorId);
        })
            ->with(['vehicle.provider', 'client', 'customer', 'schedule', 'payments'])
            ->get()
            ->map(function($booking) use ($resolveCustomerName) {
                $vehicle = $booking->vehicle;
                $client = $booking->client;
                $customer = $booking->customer;
                $schedule = $booking->schedule;

                return [
                    'id' => 'ABK-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT),
                    'booking_type' => 'vehicle',
                    'service_name' => 'Vehicle Rental',
                    'vehicle_name' => $vehicle->name ?? null,
                    'vehicle_category' => $vehicle->category ?? null,
                    'status' => $booking->status,
                    'total_amount' => $booking->total_amount,
                    'amount' => $booking->total_amount,
                    'booking_date' => $booking->created_at->format('Y-m-d'),
                    'start_date' => optional($booking->start_date)->format('Y-m-d'),
                    'end_date' => optional($booking->end_date)->format('Y-m-d'),
                    'pickup_location' => $schedule->pickup_location ?? null,
                    'dropoff_location' => $schedule->dropoff_location ?? null,
                    'booking_code' => 'ABK-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT),
                    'reference_number' => 'ABK-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT),
                    'currency' => $booking->currency ?? 'LKR',
                    'created_at' => $booking->created_at,

                    'customer_name' => $resolveCustomerName($customer, $client),
                    'customer_email' => $customer->email ?? $client->email ?? null,
                    'customer_phone' => $customer->phone ?? $client->phone ?? null,
                    'customer_address' => $customer->address ?? $client->address ?? null,

                    'payment_method' => $booking->payments->first()->payment_method ?? 'Not specified',
                    'payment_status' => $booking->payments->first()->status ?? $booking->status,

                    'notes' => $booking->notes,
                    'subtotal' => $booking->subtotal,
                    'deposit_amount' => $booking->deposit_amount,
                    'price_per_day' => $booking->price_per_day,
                    'rental_days' => $booking->rental_days,
                ];
            });

        // Fetch sea vehicle bookings where vendor is the provider
        $seaVehicleBookings = SeaVehicleBookings::whereHas('vehicle', function($q) use ($vendorId) {
            $q->where('provider_id', $vendorId);
        })
            ->with(['vehicle.provider', 'client', 'customer', 'schedule', 'payments'])
            ->get()
            ->map(function($booking) use ($resolveCustomerName) {
                $vehicle = $booking->vehicle;
                $client = $booking->client;
                $customer = $booking->customer;
                $schedule = $booking->schedule;

                return [
                    'id' => 'SBK-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT),
                    'booking_type' => 'vehicle',
                    'service_name' => 'Vehicle Rental',
                    'vehicle_name' => $vehicle->name ?? null,
                    'vehicle_category' => $vehicle->category ?? null,
                    'status' => $booking->status,
                    'total_amount' => $booking->total_amount,
                    'amount' => $booking->total_amount,
                    'booking_date' => $booking->created_at->format('Y-m-d'),
                    'start_date' => optional($booking->start_date)->format('Y-m-d'),
                    'end_date' => optional($booking->end_date)->format('Y-m-d'),
                    'pickup_location' => $schedule->pickup_location ?? null,
                    'dropoff_location' => $schedule->dropoff_location ?? null,
                    'booking_code' => 'SBK-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT),
                    'reference_number' => 'SBK-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT),
                    'currency' => $booking->currency ?? 'LKR',
                    'created_at' => $booking->created_at,

                    'customer_name' => $resolveCustomerName($customer, $client),
                    'customer_email' => $customer->email ?? $client->email ?? null,
                    'customer_phone' => $customer->phone ?? $client->phone ?? null,
                    'customer_address' => $customer->address ?? $client->address ?? null,

                    'payment_method' => $booking->payments->first()->payment_method ?? 'Not specified',
                    'payment_status' => $booking->payments->first()->status ?? $booking->status,

                    'notes' => $booking->notes,
                    'subtotal' => $booking->subtotal,
                    'deposit_amount' => $booking->deposit_amount,
                    'price_per_day' => $booking->price_per_day,
                    'rental_days' => $booking->rental_days,
                ];
            });

        $vehicleBookings = collect($landVehicleBookings)
            ->merge($airVehicleBookings)
            ->merge($seaVehicleBookings)
            ->values();

        // Fetch all flight bookings
        $flightBookings = FlightBooking::with(['user'])
            ->get()
            ->map(function($booking) {
                return [
                    'id' => $booking->id,
                    'booking_type' => 'flight',
                    'service_name' => 'Air Ticket Booking',
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
                    'service_name' => 'Vehicle Rental',
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

        // Fetch all flight bookings
        $flightBookings = FlightBooking::with(['user'])
            ->get()
            ->map(function($booking) {
                $flight = $booking->flight;
                $customer = $booking->customer;
                
                return [
                    'id' => $booking->id,
                    'booking_type' => 'flight',
                    'service_name' => 'Air Ticket Booking',
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
        $vendor   = Auth::user();

        if ($vendor->role !== 'vendor') {
            abort(403, 'Unauthorized access');
        }

        $filter = request()->get('filter', 'all');

        // Fetch all users with role = 'client'
        $clients = User::where('role', 'client')->get();

        // Aggregate vehicle booking stats per client_id for this vendor
        $vehicleStats = Booking::whereHas('vehicle', fn($q) => $q->where('provider_id', $vendorId))
            ->selectRaw('client_id, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total')
            ->groupBy('client_id')
            ->get()
            ->keyBy('client_id');

        // Aggregate flight booking stats per user_id
        $flightStats = FlightBooking::selectRaw('user_id, COUNT(*) as count')
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        $landClients = [];
        $airClients  = [];

        foreach ($clients as $user) {
            $vStat  = $vehicleStats->get($user->id);
            $fStat  = $flightStats->get($user->id);
            $vCount = (int)($vStat->count ?? 0);
            $fCount = (int)($fStat->count ?? 0);

            $base = [
                'id'             => $user->id,
                'name'           => $user->name ?? trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                'email'          => $user->email ?? 'N/A',
                'phone'          => $user->phone ?? 'N/A',
                'address'        => $user->address ?? $user->address_line1 ?? 'N/A',
                'image'          => $user->image ?? null,
                'joinDate'       => $user->created_at->format('Y-m-d'),
            ];

            if ($fCount > 0) {
                $airClients[] = array_merge($base, [
                    'vehicle_type'   => 'Air',
                    'bookings_count' => $fCount,
                    'total_spent'    => 0,
                ]);
            }

            if ($vCount > 0 || $fCount === 0) {
                $landClients[] = array_merge($base, [
                    'vehicle_type'   => 'Land',
                    'bookings_count' => $vCount,
                    'total_spent'    => (float)($vStat->total ?? 0),
                ]);
            }
        }

        return Inertia::render('Web/home/vendors/allBookings/AllClient', [
            'clients'       => [
                'land' => $landClients,
                'air'  => $airClients,
                'sea'  => [],
            ],
            'currentFilter' => $filter,
            'stats'         => [
                'total' => $clients->count(),
                'land'  => count($landClients),
                'air'   => count($airClients),
                'sea'   => 0,
            ],
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
                    'service_name'  => 'Vehicle Rental',
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
        $flightBookings = FlightBooking::with(['user'])
            ->get()
            ->map(function ($booking) {
                return [
                    'id'            => $booking->id,
                    'booking_type'  => 'flight',
                    'service_name'  => 'Air Ticket Booking',
                    'status'        => $booking->status,
                    'payment_status'=> $booking->payment_status ?? 'Pending',
                    'total_amount'  => $booking->total_amount ?? 0,
                    'booking_date'  => $booking->created_at->format('Y-m-d'),
                    'start_date' => \Carbon\Carbon::parse($booking->start_date)->format('Y-m-d'),
                    'end_date'   => \Carbon\Carbon::parse($booking->end_date)->format('Y-m-d'),
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

    public function payment()
    {
        $vendorId = Auth::id();
        $vendor   = Auth::user();

        if ($vendor->role !== 'vendor') {
            abort(403, 'Unauthorized access');
        }

        // Aggregate payment transactions from vehicle bookings
        $vehicleBookings = Booking::whereHas('vehicle', function ($q) use ($vendorId) {
            $q->where('provider_id', $vendorId);
        })
            ->with(['vehicle', 'client', 'customer', 'payments'])
            ->latest('created_at')
            ->get();

        $transactions   = [];
        $totalRevenue   = 0;
        $totalCompleted = 0;
        $totalPending   = 0;
        $completedCount = 0;
        $pendingCount   = 0;

        foreach ($vehicleBookings as $booking) {
            $vehicle     = $booking->vehicle;
            $client      = $booking->client ?? $booking->customer;
            $vehicleName = $vehicle
                ? trim(($vehicle->manufacturer ?? '') . ' ' . ($vehicle->model ?? ''))
                : 'N/A';

            foreach ($booking->payments as $payment) {
                $status = strtolower($payment->status);
                $isPaid = in_array($status, ['paid', 'completed', 'success']);

                if ($isPaid) {
                    $totalCompleted += (float) $payment->amount_paid;
                    $completedCount++;
                } else {
                    $totalPending += (float) $payment->amount_paid;
                    $pendingCount++;
                }
                $totalRevenue += (float) $payment->amount_paid;

                $transactions[] = [
                    'id'           => 'BK-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT),
                    'booking_id'   => $booking->id,
                    'payment_id'   => $payment->id,
                    'client'       => $client?->name ?? 'N/A',
                    'car'          => $vehicleName ?: 'N/A',
                    'rentPerDay'   => 'Rs. ' . number_format($booking->price_per_day ?? 0, 2),
                    'days'         => $booking->rental_days ?? '0',
                    'amount'       => 'Rs. ' . number_format($payment->amount_paid ?? 0, 2),
                    'amount_raw'   => (float) ($payment->amount_paid ?? 0),
                    'dueDate'      => $booking->created_at ? $booking->created_at->format('Y.m.d') : 'N/A',
                    'paymentDate'  => $payment->created_at ? $payment->created_at->format('Y.m.d') : 'N/A',
                    'method'       => $payment->method ?? 'N/A',
                    'status'       => $isPaid ? 'Completed' : 'Pending',
                    'statusColor'  => $isPaid ? '#50AE31' : '#F0BB0D',
                    'statusBg'     => $isPaid ? '#6DB4464D' : '#FFCD294D',
                    'tx_reference' => $payment->tx_reference ?? 'N/A',
                    'service_name' => 'Vehicle Rental',
                ];
            }
        }

        // Also aggregate flight booking totals
        $flightBookings = FlightBooking::latest('created_at')->get();
        foreach ($flightBookings as $booking) {
            $amount = (float) ($booking->total_amount ?? 0);
            if ($amount <= 0) {
                continue;
            }
            $isPaid = in_array(strtolower($booking->payment_status ?? ''), ['paid', 'completed']);
            if ($isPaid) {
                $totalCompleted += $amount;
                $completedCount++;
            } else {
                $totalPending += $amount;
                $pendingCount++;
            }
            $totalRevenue += $amount;

            $transactions[] = [
                'id'           => 'FL-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT),
                'booking_id'   => $booking->id,
                'payment_id'   => null,
                'client'       => $booking->name ?? 'N/A',
                'car'          => 'Flight Ticket',
                'rentPerDay'   => '-',
                'days'         => '-',
                'amount'       => 'Rs. ' . number_format($amount, 2),
                'amount_raw'   => $amount,
                'dueDate'      => $booking->created_at ? $booking->created_at->format('Y.m.d') : 'N/A',
                'paymentDate'  => $booking->created_at ? $booking->created_at->format('Y.m.d') : 'N/A',
                'method'       => 'N/A',
                'status'       => $isPaid ? 'Completed' : 'Pending',
                'statusColor'  => $isPaid ? '#50AE31' : '#F0BB0D',
                'statusBg'     => $isPaid ? '#6DB4464D' : '#FFCD294D',
                'tx_reference' => 'N/A',
                'service_name' => 'Air Ticket Booking',
            ];
        }

        // Sort by date descending
        usort($transactions, fn ($a, $b) => strcmp($b['dueDate'], $a['dueDate']));

        // Monthly revenue chart (last 6 months)
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthEnd   = Carbon::now()->subMonths($i)->endOfMonth();
            $revenue    = Booking::whereHas('vehicle', function ($q) use ($vendorId) {
                $q->where('provider_id', $vendorId);
            })
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->with('payments')
                ->get()
                ->flatMap(fn ($b) => $b->payments)
                ->sum('amount_paid');

            $monthlyRevenue[] = [
                'month'   => $monthStart->format('M'),
                'revenue' => (float) $revenue,
            ];
        }

        $stats = [
            'total_revenue'      => $totalRevenue,
            'total_completed'    => $totalCompleted,
            'total_pending'      => $totalPending,
            'completed_count'    => $completedCount,
            'pending_count'      => $pendingCount,
            'total_transactions' => count($transactions),
        ];

        return Inertia::render('Web/home/vendors/allBookings/PaymentPage', [
            'transactions'  => $transactions,
            'stats'         => $stats,
            'monthlyRevenue' => $monthlyRevenue,
        ]);
    }

    public function expenses()
    {
        $vendorId = Auth::id();
        $vendor   = Auth::user();

        if ($vendor->role !== 'vendor') {
            abort(403, 'Unauthorized access');
        }

        return Inertia::render('Web/home/vendors/allBookings/ExpensesPage');
    }
}
