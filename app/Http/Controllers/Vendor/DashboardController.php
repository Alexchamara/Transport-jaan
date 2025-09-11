<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\BookingSchedule;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $vendor      = $request->user();
        $vendorId    = $vendor->id;
        $now         = now();
        $year        = (int) $now->year;

        // Vehicles that belong to this vendor
        $vehicleIds = Vehicle::where('provider_id', $vendorId)->pluck('id');

        // ===== KPI Cards =====
        $totalCars  = Vehicle::where('provider_id', $vendorId)->count();

        $rentedCars = Booking::whereIn('vehicle_id', $vehicleIds)
            ->whereIn('status', ['confirmed', 'ongoing'])
            ->whereHas('schedule', function ($q) use ($now) {
                $q->where('pickup_at', '<=', $now)->where('dropoff_at', '>=', $now);
            })
            ->distinct('vehicle_id')
            ->count('vehicle_id');

        $newBookings = Booking::whereIn('vehicle_id', $vehicleIds)
            ->where('created_at', '>=', $now->copy()->subDays(7))
            ->count();

        // Use payments for revenue
        $totalRevenue = (float) BookingPayment::whereHas('booking', function ($q) use ($vehicleIds) {
                $q->whereIn('vehicle_id', $vehicleIds);
            })
            ->whereIn('status', ['paid', 'completed', 'success'])
            ->sum('amount_paid');

        // ===== Booking Overview (monthly counts by pickup date) =====
        $monthlyBookingsMap = BookingSchedule::whereHas('booking', function ($q) use ($vehicleIds) {
                $q->whereIn('vehicle_id', $vehicleIds);
            })
            ->whereYear('pickup_at', $year)
            ->selectRaw('MONTH(pickup_at) as m, COUNT(*) as c')
            ->groupBy('m')
            ->pluck('c', 'm');

        $bookingOverview = [];
        for ($m = 1; $m <= 12; $m++) {
            $bookingOverview[] = [
                'name'     => Carbon::createFromDate($year, $m, 1)->shortMonthName,
                'bookings' => (int) ($monthlyBookingsMap[$m] ?? 0),
            ];
        }

        // ===== Earning Summary (monthly revenue) =====
        $monthlyRevenueMap = BookingPayment::whereHas('booking', function ($q) use ($vehicleIds) {
                $q->whereIn('vehicle_id', $vehicleIds);
            })
            ->whereYear('created_at', $year)
            ->whereIn('status', ['paid', 'completed', 'success'])
            ->selectRaw('MONTH(created_at) as m, SUM(amount_paid) as s')
            ->groupBy('m')
            ->pluck('s', 'm');

        $earningSummary = [];
        for ($m = 1; $m <= 12; $m++) {
            $earningSummary[] = [
                'name'  => Carbon::createFromDate($year, $m, 1)->shortMonthName,
                'value' => (float) ($monthlyRevenueMap[$m] ?? 0),
            ];
        }

        // ===== Real Status (donut) =====
        $statusCounts = Booking::whereIn('vehicle_id', $vehicleIds)
            ->select('status', DB::raw('COUNT(*) as c'))
            ->groupBy('status')
            ->pluck('c', 'status');

        $hired     = (int) ($statusCounts['confirmed'] ?? 0) + (int) ($statusCounts['ongoing'] ?? 0);
        $pending   = (int) ($statusCounts['pending'] ?? 0);
        $cancelled = (int) ($statusCounts['cancelled'] ?? $statusCounts['canceled'] ?? 0);

        $realStatus = [
            ['name' => 'Hired',     'value' => $hired,     'color' => '#3DD0FF', 'change' => null],
            ['name' => 'Pending',   'value' => $pending,   'color' => '#0955AC', 'change' => null],
            ['name' => 'Cancelled', 'value' => $cancelled, 'color' => '#C4C4C4', 'change' => null],
        ];

        // ===== Car Types (distribution by category or model) =====
        $totalCarsForPercent = max($totalCars, 1);
        $carTypes = [];
        try {
            $rows = Vehicle::where('provider_id', $vendorId)
                ->select('category_id', DB::raw('COUNT(*) as c'))
                ->groupBy('category_id')
                ->orderByDesc('c')
                ->limit(6)
                ->get();

            foreach ($rows as $row) {
                $name = 'Category ' . $row->category_id;
                // If you have VehicleCategory::class with "name", you can map it here.
                $carTypes[] = [
                    'name'    => $name,
                    'percent' => round(($row->c / $totalCarsForPercent) * 100),
                    'img'     => null,
                ];
            }
        } catch (\Throwable $e) {
            $rows = Vehicle::where('provider_id', $vendorId)
                ->select('model', DB::raw('COUNT(*) as c'))
                ->groupBy('model')
                ->orderByDesc('c')
                ->limit(6)
                ->get();

            foreach ($rows as $row) {
                $carTypes[] = [
                    'name'    => $row->model ?: 'Unknown',
                    'percent' => round(($row->c / $totalCarsForPercent) * 100),
                    'img'     => null,
                ];
            }
        }

        // ===== Bookings for table =====
        $recentBookings = Booking::with(['vehicle', 'schedule', 'client', 'customer', 'payments'])
            ->whereIn('vehicle_id', $vehicleIds)
            ->latest('created_at')
            ->limit(10)
            ->get();

        $bookings = $recentBookings->map(function (Booking $b) use ($now) {
            $veh = $b->vehicle;
            $sch = $b->schedule;

            $start = optional($sch?->pickup_at)->format('M j, Y');
            $end   = optional($sch?->dropoff_at)->format('M j, Y');

            $days = $b->rental_days;
            if (!$days && $sch?->pickup_at && $sch?->dropoff_at) {
                $days = Carbon::parse($sch->pickup_at)->diffInDays(Carbon::parse($sch->dropoff_at)) ?: 1;
            }

            $paid  = (float) $b->payments()->whereIn('status', ['paid', 'completed', 'success'])->sum('amount_paid');
            $total = (float) ($b->total_amount ?? 0.0);
            $paymentStatus = $paid >= $total && $total > 0 ? 'Paid' : ($paid > 0 ? 'Partial' : 'Pending');

            $status = ucfirst($b->status ?: 'pending');
            if (in_array($b->status, ['confirmed', 'ongoing']) && $sch?->pickup_at && $sch?->dropoff_at) {
                $status = (Carbon::parse($sch->pickup_at) <= $now && Carbon::parse($sch->dropoff_at) >= $now)
                    ? 'Ongoing' : ucfirst($b->status);
            }
            if (in_array($b->status, ['returned', 'completed'])) {
                $status = 'Returned';
            }

            $customerName = $b->customer->full_name
                ?? $b->client->name
                ?? 'Customer';

            return [
                'id'            => 'BKG-' . str_pad($b->id, 5, '0', STR_PAD_LEFT),
                'date'          => optional($b->created_at)->format('M j, Y'),
                'customer'      => $customerName,
                'car'           => $veh?->model ?? '—',
                'plate'         => $veh?->registration_number ?? '—',
                'duration'      => $days ? $days . ' days' : '—',
                'startDate'     => $start ?? '—',
                'endDate'       => $end ?? '—',
                'price'         => '$' . number_format($total, 0),
                'paymentStatus' => $paymentStatus,
                'status'        => $status,
            ];
        })->values();

        // ===== Recent Activities (robust & sortable) =====
        $activities = [];

        // From bookings
        $bookingEvents = Booking::with(['vehicle', 'client', 'customer'])
            ->whereIn('vehicle_id', $vehicleIds)
            ->latest('updated_at')
            ->limit(40)
            ->get();

        foreach ($bookingEvents as $b) {
            $veh   = $b->vehicle;
            $plate = $veh?->registration_number ? " ({$veh->registration_number})" : '';
            $customerName = $b->customer->full_name
                ?? $b->client->name
                ?? 'Customer';

            $desc = match (true) {
                in_array($b->status, ['returned', 'completed']) =>
                    "{$customerName} completed a booking for {$veh?->model}{$plate}",
                in_array($b->status, ['cancelled', 'canceled']) =>
                    "{$customerName} cancelled a booking for {$veh?->model}{$plate}",
                in_array($b->status, ['confirmed', 'ongoing']) =>
                    "{$customerName} booking in progress for {$veh?->model}{$plate}",
                default => "{$customerName} booked {$veh?->model}{$plate}",
            };

            $activities[] = [
                'datetime'    => optional($b->updated_at ?? $b->created_at)->toIso8601String(),
                'description' => $desc,
                'type'        => 'booking',
            ];
        }

        // From payments
        $paymentEvents = BookingPayment::with(['booking.vehicle', 'booking.client', 'booking.customer'])
            ->whereHas('booking', fn($q) => $q->whereIn('vehicle_id', $vehicleIds))
            ->latest('created_at')
            ->limit(40)
            ->get();

        foreach ($paymentEvents as $p) {
            $b   = $p->booking;
            if (!$b) continue;
            $veh = $b->vehicle;

            $amt = number_format((float) $p->amount_paid, 2);
            $statusLabel = ucfirst($p->status ?? 'paid');
            $desc = "Payment {$statusLabel} \${$amt} for " . ($veh?->model ?? 'vehicle');

            $activities[] = [
                'datetime'    => optional($p->created_at)->toIso8601String(),
                'description' => $desc,
                'type'        => 'payment',
            ];
        }

        // Sort desc by datetime and take top 20
        usort($activities, function ($a, $b) {
            return strcmp($b['datetime'] ?? '', $a['datetime'] ?? '');
        });
        $recentActivities = array_slice($activities, 0, 20);

        return Inertia::render('Web/home/vendors/Dashboard', [
            'cards' => [
                'totalRevenue' => round($totalRevenue, 2),
                'newBookings'  => (int) $newBookings,
                'rentedCars'   => (int) $rentedCars,
                'totalCars'    => (int) $totalCars,
            ],
            'bookingOverview' => $bookingOverview,
            'earningSummary'  => $earningSummary,
            'realStatus'      => $realStatus,
            'carTypes'        => $carTypes,
            'bookings'        => $bookings,
            'bookings_meta'   => [],
            'filters'         => [],
            'vendorUser'      => [
                'name' => $vendor->name,
                'role' => 'Vendor',
            ],
            'recentActivities'=> $recentActivities,
        ]);
    }
}
