<?php

namespace App\Http\Controllers\WarehouseControllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Warehouse\WarehouseBooking;
use App\Models\Warehouse\WarehouseUnit;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Carbon\Carbon;
use Throwable;

class WarehouseCalendarController extends Controller
{
    public function index(Request $request)
    {
        try {
            $vendor = Auth::user();
            $vendorId = $vendor?->id;

            // Get filter parameters
            $month = $request->get('month', now()->month);
            $year = $request->get('year', now()->year);
            $userId = $request->get('user_id'); // Optional: filter by specific user

            // Build date range for the calendar view
            $startDate = Carbon::create($year, $month, 1)->startOfMonth();
            $endDate = Carbon::create($year, $month, 1)->endOfMonth();

            // Base query for warehouse bookings
            $query = WarehouseBooking::query()
                ->when($vendorId, function ($q) use ($vendorId) {
                    $q->whereHas('warehouseUnit', fn ($w) => $w->where('user_id', $vendorId));
                })
                ->with(['user', 'warehouseUnit'])
                ->where(function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('start_date', [$startDate, $endDate])
                      ->orWhereBetween('end_date', [$startDate, $endDate])
                      ->orWhere(function ($ov) use ($startDate, $endDate) {
                          $ov->where('start_date', '<=', $startDate)->where('end_date', '>=', $endDate);
                      });
                });

            // Filter by user if specified
            if ($userId) {
                $query->where('user_id', $userId);
            }

            $bookings = $query->get();

            // Process bookings into calendar events
            $events = [];
            foreach ($bookings as $booking) {
                $client = $booking->user;
                $warehouse = $booking->warehouseUnit;

                if (!$booking->start_date || !$booking->end_date) continue;

                $startDate = Carbon::parse($booking->start_date);
                $endDate = Carbon::parse($booking->end_date);

                // Determine status color
                $statusMap = [
                    'completed' => 'done',
                    'finished' => 'done',
                    'active' => 'done',
                    'confirmed' => 'done',
                    'cancelled' => 'cancelled',
                    'canceled' => 'cancelled',
                    'pending' => 'done',
                ];
                $status = $statusMap[strtolower($booking->status)] ?? 'done';

                // Format goods type as title
                $title = $booking->goods_type ?? $warehouse?->title ?? 'Warehouse Storage';

                $events[] = [
                    'id' => $booking->id,
                    'title' => $title,
                    'person' => $client?->name ?? 'Unknown Client',
                    'personImage' => $client?->profile_photo_url ?? null,
                    'vehicleImage' => null, // Warehouse doesn't have vehicle images
                    'status' => $status,
                    'pickup_at' => $startDate->toIso8601String(),
                    'dropoff_at' => $endDate->toIso8601String(),
                    'pickup_location' => $warehouse?->address ?? 'N/A',
                    'dropoff_location' => $warehouse?->address ?? 'N/A',
                    'pickup_date' => $startDate->format('Y-m-d'),
                    'pickup_time' => $startDate->format('g:i A'),
                    'dropoff_date' => $endDate->format('Y-m-d'),
                    'dropoff_time' => $endDate->format('g:i A'),
                    'rental_days' => $booking->duration_months ?? 0,
                    'total_amount' => (float)($booking->final_amount ?? 0),
                    'vehicle' => [
                        'name' => $title,
                        'type' => $booking->storage_type ?? 'N/A',
                        'plate_number' => $booking->booking_reference ?? 'N/A',
                        'transmission' => $booking->required_space . ' sq ft' ?? 'N/A',
                    ],
                    'client' => [
                        'name' => $booking->company_name ?? $client?->name ?? 'Unknown',
                        'email' => $booking->email ?? $client?->email ?? 'N/A',
                        'phone' => $booking->phone ?? $client?->phone ?? 'N/A',
                    ],
                    'notes' => $booking->special_instructions ?? $booking->notes ?? null,
                ];
            }

            // Get all unique clients who have bookings with this vendor
            $clients = WarehouseBooking::query()
                ->when($vendorId, function ($q) use ($vendorId) {
                    $q->whereHas('warehouseUnit', fn ($w) => $w->where('user_id', $vendorId));
                })
                ->with('user')
                ->get()
                ->pluck('user')
                ->filter()
                ->unique('id')
                ->map(fn($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'email' => $c->email,
                ])
                ->values();

            // Get unread notification count
            $unreadNotifications = Notification::where('user_id', $vendorId)->unread()->count();

            return Inertia::render('Web/home/vendors/warehouse/Calendar', [
                'events' => $events,
                'clients' => $clients,
                'currentMonth' => (int)$month,
                'currentYear' => (int)$year,
                'selectedUserId' => $userId,
                'vendorUser' => [
                    'name' => $vendor?->name ?? 'Vendor',
                    'role' => 'Warehouse Vendor',
                ],
                'unreadNotifications' => $unreadNotifications,
            ]);

        } catch (Throwable $e) {
            report($e);

            return Inertia::render('Web/home/vendors/warehouse/Calendar', [
                'events' => [],
                'clients' => [],
                'currentMonth' => now()->month,
                'currentYear' => now()->year,
                'selectedUserId' => null,
                'vendorUser' => [
                    'name' => Auth::user()?->name ?? 'Vendor',
                    'role' => 'Warehouse Vendor',
                ],
                'unreadNotifications' => 0,
                'server_error' => 'Failed to load calendar data. Check logs.',
            ]);
        }
    }
}
