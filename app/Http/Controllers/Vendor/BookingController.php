<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Carbon\Carbon;
use Throwable;

class BookingController extends Controller
{
    public function page(Request $request)
    {
        try {
            $vendor     = Auth::user();
            $vendorId   = $vendor?->id;

            // Pick the first existing owner column from vehicles table
            $ownerCol = collect(['provider_id', 'vendor_id', 'owner_id', 'user_id'])
                ->first(fn ($col) => Schema::hasColumn('vehicles', $col));

            // Base query with safe vendor filter (only if we found a real column)
            $base = Booking::query()
                ->when($ownerCol && $vendorId, function ($q) use ($ownerCol, $vendorId) {
                    $q->whereHas('vehicle', fn ($v) => $v->where($ownerCol, $vendorId));
                })
                ->with(['client', 'customer', 'vehicle', 'schedule', 'payments'])
                ->latest('created_at');

            $rows = $base->take(100)->get();

            // Map to your table row shape (no fatal if schedule/vehicle missing)
            $initialBookings = $rows->map(function ($b) {
                $vehicleSnap = $b->vehicle_snapshot ?: [];
                $veh         = $b->vehicle;

                $carModel = trim(($vehicleSnap['make'] ?? '') . ' ' . ($vehicleSnap['model'] ?? ''));
                if (!$carModel && $veh) {
                    $carModel = trim(($veh->make ?? '') . ' ' . ($veh->model ?? ''));
                }
                $plate = $vehicleSnap['plate_number'] ?? ($veh->plate_number ?? '—');

                $clientName = $b->client?->name
                    ?? $b->customer?->name
                    ?? '—';

                $start = $b->start_date ?: ($b->schedule?->pickup_at ? Carbon::parse($b->schedule->pickup_at) : null);
                $end   = $b->end_date   ?: ($b->schedule?->dropoff_at ? Carbon::parse($b->schedule->dropoff_at) : null);

                $total         = (float) ($b->total_amount ?? $b->subtotal ?? 0);
                $paid          = (float) $b->payments->sum('amount');
                $paymentStatus = ($total > 0 && $paid >= $total) ? 'Paid' : 'Pending';

                // Normalize status to UI labels
                $map = [
                    'confirmed' => 'Ongoing',
                    'active'    => 'Ongoing',
                    'ongoing'   => 'Ongoing',
                    'completed' => 'Returned',
                    'finished'  => 'Returned',
                    'returned'  => 'Returned',
                    'cancelled' => 'Cancelled',
                    'canceled'  => 'Cancelled',
                ];
                $statusKey = strtolower((string) $b->status);
                $status    = $map[$statusKey] ?? 'Ongoing';

                return [
                    'id'            => $b->id,
                    'bookingDate'   => $b->created_at?->format('Y-m-d') ?? '',
                    'clientName'    => $clientName,
                    'carModel'      => $carModel ?: '—',
                    'carPlate'      => $plate,
                    'plan'          => $b->rental_days ? ($b->rental_days . ' days') : '—',
                    'startDate'     => $start?->format('Y-m-d') ?? '',
                    'endDate'       => $end?->format('Y-m-d') ?? '',
                    'payment'       => number_format($total, 2),
                    'paymentStatus' => $paymentStatus,
                    'status'        => $status,
                ];
            })->values();

            // Build Booking Overview (last 8 months)
            $done   = ['completed', 'finished', 'returned'];
            $cancel = ['cancelled', 'canceled'];

            $months = collect(range(0, 7))->map(fn ($i) => Carbon::now()->subMonths(7 - $i)->startOfMonth());

            $bookingData = $months->map(function (Carbon $m) use ($ownerCol, $vendorId, $done, $cancel) {
                $start = $m->copy()->startOfMonth();
                $end   = $m->copy()->endOfMonth();

                $doneCount = Booking::query()
                    ->when($ownerCol && $vendorId, fn ($q) => $q->whereHas('vehicle', fn ($v) => $v->where($ownerCol, $vendorId)))
                    ->whereBetween('created_at', [$start, $end])
                    ->whereRaw('LOWER(status) IN (' . implode(',', array_fill(0, count($done), '?')) . ')', $done)
                    ->count();

                $cancelCount = Booking::query()
                    ->when($ownerCol && $vendorId, fn ($q) => $q->whereHas('vehicle', fn ($v) => $v->where($ownerCol, $vendorId)))
                    ->whereBetween('created_at', [$start, $end])
                    ->whereRaw('LOWER(status) IN (' . implode(',', array_fill(0, count($cancel), '?')) . ')', $cancel)
                    ->count();

                return [
                    'name'      => $m->format('M'),
                    'done'      => $doneCount,
                    'cancelled' => $cancelCount,
                ];
            })->values();

            return Inertia::render('Web/home/vendors/Booking', [
                'initialBookings' => $initialBookings,
                'bookingData'     => $bookingData,
                'vendorUser'      => [
                    'name' => $vendor?->name ?? 'Vendor',
                    'role' => 'Vendor',
                ],
            ]);
        } catch (Throwable $e) {
            // Log the real error and still render the page so the SPA doesn’t white-screen.
            report($e);

            return Inertia::render('Web/home/vendors/Booking', [
                'initialBookings' => [],
                'bookingData'     => [],
                'vendorUser'      => [
                    'name' => Auth::user()?->name ?? 'Vendor',
                    'role' => 'Vendor',
                ],
                'server_error'    => 'Failed to load bookings. Check storage/logs/laravel.log.',
            ]);
        }
    }

    public function clients(Request $request)
    {
        try {
            $vendor = Auth::user();
            $vendorId = $vendor?->id;

            // Pick the first existing owner column from vehicles table
            $ownerCol = collect(['provider_id', 'vendor_id', 'owner_id', 'user_id'])
                ->first(fn ($col) => Schema::hasColumn('vehicles', $col));

            // Get filter parameter (default: all)
            $filter = $request->get('filter', 'all'); // all, land, air, sea

            // Base query to get bookings with clients
            $query = Booking::query()
                ->when($ownerCol && $vendorId, function ($q) use ($ownerCol, $vendorId) {
                    $q->whereHas('vehicle', fn ($v) => $v->where($ownerCol, $vendorId));
                })
                ->with(['client', 'customer', 'vehicle.category', 'schedule', 'payments'])
                ->latest('created_at');

            // Filter by vehicle type if specified
            if ($filter !== 'all') {
                $query->whereHas('vehicle', function ($q) use ($filter) {
                    $q->where('type', $filter);
                });
            }

            $bookings = $query->get();

            // Group clients by vehicle type
            $clientsByType = [
                'land' => [],
                'air' => [],
                'sea' => [],
            ];

            // Process bookings to extract unique clients with their booking info
            $clientsMap = [];

            foreach ($bookings as $booking) {
                $client = $booking->client ?? $booking->customer;
                $vehicle = $booking->vehicle;

                if (!$client || !$vehicle) continue;

                $clientKey = $client->email ?? $client->id;
                $vehicleType = $vehicle->type ?? 'land';

                if (!isset($clientsMap[$vehicleType][$clientKey])) {
                    $clientsMap[$vehicleType][$clientKey] = [
                        'id' => $client->id,
                        'name' => $client->name ?? '—',
                        'email' => $client->email ?? '—',
                        'phone' => $client->phone ?? '—',
                        'address' => $client->address ?? '—',
                        'bookings_count' => 0,
                        'total_spent' => 0,
                        'vehicle_type' => ucfirst($vehicleType),
                        'last_booking_date' => null,
                        'bookings' => [],
                    ];
                }

                // Add booking details
                $clientsMap[$vehicleType][$clientKey]['bookings_count']++;
                $clientsMap[$vehicleType][$clientKey]['total_spent'] += (float)($booking->total_amount ?? 0);

                $bookingDate = $booking->created_at ? $booking->created_at->format('Y-m-d') : null;
                if (!$clientsMap[$vehicleType][$clientKey]['last_booking_date'] ||
                    ($bookingDate && $bookingDate > $clientsMap[$vehicleType][$clientKey]['last_booking_date'])) {
                    $clientsMap[$vehicleType][$clientKey]['last_booking_date'] = $bookingDate;
                }

                $clientsMap[$vehicleType][$clientKey]['bookings'][] = [
                    'id' => $booking->id,
                    'booking_date' => $bookingDate,
                    'vehicle' => $vehicle->model ?? '—',
                    'status' => $booking->status ?? 'pending',
                    'amount' => (float)($booking->total_amount ?? 0),
                ];
            }

            // Convert to arrays and format
            foreach ($clientsMap as $type => $clients) {
                $clientsByType[$type] = array_values($clients);
            }

            // Statistics
            $stats = [
                'total_clients' => count(array_unique(array_merge(
                    array_keys($clientsMap['land'] ?? []),
                    array_keys($clientsMap['air'] ?? []),
                    array_keys($clientsMap['sea'] ?? [])
                ))),
                'land_clients' => count($clientsByType['land']),
                'air_clients' => count($clientsByType['air']),
                'sea_clients' => count($clientsByType['sea']),
            ];

            return Inertia::render('Web/home/vendors/Client', [
                'clients' => $clientsByType,
                'currentFilter' => $filter,
                'stats' => $stats,
            ]);

        } catch (Throwable $e) {
            report($e);

            return Inertia::render('Web/home/vendors/Client', [
                'clients' => [
                    'land' => [],
                    'air' => [],
                    'sea' => [],
                ],
                'currentFilter' => 'all',
                'stats' => [
                    'total_clients' => 0,
                    'land_clients' => 0,
                    'air_clients' => 0,
                    'sea_clients' => 0,
                ],
                'server_error' => 'Failed to load clients. Check logs.',
            ]);
        }
    }

    public function payments(Request $request)
    {
        try {
            $vendor = Auth::user();
            $vendorId = $vendor?->id;

            // Pick the first existing owner column from vehicles table
            $ownerCol = collect(['provider_id', 'vendor_id', 'owner_id', 'user_id'])
                ->first(fn ($col) => Schema::hasColumn('vehicles', $col));

            // Get all bookings with payments for this vendor
            $bookings = Booking::query()
                ->when($ownerCol && $vendorId, function ($q) use ($ownerCol, $vendorId) {
                    $q->whereHas('vehicle', fn ($v) => $v->where($ownerCol, $vendorId));
                })
                ->with(['client', 'customer', 'vehicle', 'payments', 'schedule'])
                ->latest('created_at')
                ->get();

            // Process payments
            $transactions = [];
            $totalRevenue = 0;
            $totalPending = 0;
            $totalCompleted = 0;
            $completedCount = 0;
            $pendingCount = 0;

            foreach ($bookings as $booking) {
                $vehicle = $booking->vehicle;
                $client = $booking->client ?? $booking->customer;

                // Get vehicle model/name
                $vehicleSnap = $booking->vehicle_snapshot ? json_decode($booking->vehicle_snapshot, true) : [];
                $vehicleName = $vehicle
                    ? trim(($vehicle->manufacturer ?? '') . ' ' . ($vehicle->model ?? ''))
                    : ($vehicleSnap['model'] ?? 'N/A');

                foreach ($booking->payments as $payment) {
                    $status = strtolower($payment->status);
                    $isPaid = in_array($status, ['paid', 'completed', 'success']);

                    if ($isPaid) {
                        $totalCompleted += (float)$payment->amount_paid;
                        $completedCount++;
                    } else {
                        $totalPending += (float)$payment->amount_paid;
                        $pendingCount++;
                    }

                    $totalRevenue += (float)$payment->amount_paid;

                    $transactions[] = [
                        'id' => 'BK-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT),
                        'booking_id' => $booking->id,
                        'payment_id' => $payment->id,
                        'client' => $client?->name ?? 'N/A',
                        'car' => $vehicleName ?: 'N/A',
                        'rentPerDay' => '$' . number_format($booking->price_per_day ?? 0, 2),
                        'days' => $booking->rental_days ?? '0',
                        'amount' => '$' . number_format($payment->amount_paid ?? 0, 2),
                        'amount_raw' => (float)($payment->amount_paid ?? 0),
                        'dueDate' => $booking->created_at ? $booking->created_at->format('Y.m.d') : 'N/A',
                        'paymentDate' => $payment->created_at ? $payment->created_at->format('Y.m.d') : 'N/A',
                        'method' => $payment->method ?? 'N/A',
                        'status' => $isPaid ? 'Completed' : 'Pending',
                        'statusColor' => $isPaid ? '#50AE31' : '#F0BB0D',
                        'statusBg' => $isPaid ? '#6DB4464D' : '#FFCD294D',
                        'tx_reference' => $payment->tx_reference ?? 'N/A',
                    ];
                }
            }

            // Calculate monthly revenue for chart (last 6 months)
            $monthlyRevenue = [];
            for ($i = 5; $i >= 0; $i--) {
                $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
                $monthEnd = Carbon::now()->subMonths($i)->endOfMonth();

                $revenue = Booking::query()
                    ->when($ownerCol && $vendorId, function ($q) use ($ownerCol, $vendorId) {
                        $q->whereHas('vehicle', fn ($v) => $v->where($ownerCol, $vendorId));
                    })
                    ->whereBetween('created_at', [$monthStart, $monthEnd])
                    ->with('payments')
                    ->get()
                    ->flatMap(fn($b) => $b->payments)
                    ->where('status', 'paid')
                    ->sum('amount_paid');

                $monthlyRevenue[] = [
                    'month' => $monthStart->format('M'),
                    'revenue' => (float)$revenue,
                ];
            }

            $stats = [
                'total_revenue' => $totalRevenue,
                'total_completed' => $totalCompleted,
                'total_pending' => $totalPending,
                'completed_count' => $completedCount,
                'pending_count' => $pendingCount,
                'total_transactions' => count($transactions),
            ];

            return Inertia::render('Web/home/vendors/Payment', [
                'transactions' => $transactions,
                'stats' => $stats,
                'monthlyRevenue' => $monthlyRevenue,
            ]);

        } catch (Throwable $e) {
            report($e);

            return Inertia::render('Web/home/vendors/Payment', [
                'transactions' => [],
                'stats' => [
                    'total_revenue' => 0,
                    'total_completed' => 0,
                    'total_pending' => 0,
                    'completed_count' => 0,
                    'pending_count' => 0,
                    'total_transactions' => 0,
                ],
                'monthlyRevenue' => [],
                'server_error' => 'Failed to load payment data. Check logs.',
            ]);
        }
    }
}
