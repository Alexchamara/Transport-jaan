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
}
