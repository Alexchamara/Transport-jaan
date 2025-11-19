<?php

namespace App\Http\Controllers\WarehouseControllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Warehouse\WarehouseBooking;
use App\Models\Warehouse\WarehouseUnit;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Throwable;

class WarehouseClientController extends Controller
{
    public function index(Request $request)
    {
        try {
            $vendor = Auth::user();
            $vendorId = $vendor?->id;

            // Get filter parameter (default: all)
            $filter = $request->get('filter', 'all'); // all, cold, dry, general

            // Base query to get bookings with clients
            $query = WarehouseBooking::query()
                ->when($vendorId, function ($q) use ($vendorId) {
                    $q->whereHas('warehouseUnit', fn ($w) => $w->where('user_id', $vendorId));
                })
                ->with(['user', 'warehouseUnit'])
                ->latest('created_at');

            // Filter by storage type if specified
            if ($filter !== 'all') {
                $query->where('storage_type', $filter);
            }

            $bookings = $query->get();

            // Group clients by storage type
            $clientsByType = [
                'cold' => [],
                'dry' => [],
                'general' => [],
            ];

            // Process bookings to extract unique clients with their booking info
            $clientsMap = [];

            foreach ($bookings as $booking) {
                $client = $booking->user;
                $warehouse = $booking->warehouseUnit;

                if (!$client) continue;

                $clientKey = $client->email ?? $client->id;
                $storageType = strtolower($booking->storage_type ?? 'general');

                if (!isset($clientsMap[$storageType][$clientKey])) {
                    $clientsMap[$storageType][$clientKey] = [
                        'id' => $client->id,
                        'name' => $booking->company_name ?? $client->name ?? '—',
                        'email' => $booking->email ?? $client->email ?? '—',
                        'phone' => $booking->phone ?? $client->phone ?? '—',
                        'address' => $booking->company_address ?? $client->address ?? '—',
                        'bookings_count' => 0,
                        'total_spent' => 0,
                        'storage_type' => ucfirst($storageType),
                        'total_space' => 0,
                        'last_booking_date' => null,
                        'bookings' => [],
                    ];
                }

                // Add booking details
                $clientsMap[$storageType][$clientKey]['bookings_count']++;
                $clientsMap[$storageType][$clientKey]['total_spent'] += (float)($booking->final_amount ?? 0);
                $clientsMap[$storageType][$clientKey]['total_space'] += (float)($booking->required_space ?? 0);

                $bookingDate = $booking->created_at ? $booking->created_at->format('Y-m-d') : null;
                if (!$clientsMap[$storageType][$clientKey]['last_booking_date'] ||
                    ($bookingDate && $bookingDate > $clientsMap[$storageType][$clientKey]['last_booking_date'])) {
                    $clientsMap[$storageType][$clientKey]['last_booking_date'] = $bookingDate;
                }

                $clientsMap[$storageType][$clientKey]['bookings'][] = [
                    'id' => $booking->id,
                    'booking_date' => $bookingDate,
                    'warehouse' => $warehouse?->title ?? '—',
                    'goods_type' => $booking->goods_type ?? '—',
                    'status' => $booking->status ?? 'pending',
                    'amount' => (float)($booking->final_amount ?? 0),
                    'space' => (float)($booking->required_space ?? 0),
                ];
            }

            // Convert to arrays and format
            foreach ($clientsMap as $type => $clients) {
                $clientsByType[$type] = array_values($clients);
            }

            // Statistics
            $stats = [
                'total_clients' => count(array_unique(array_merge(
                    array_keys($clientsMap['cold'] ?? []),
                    array_keys($clientsMap['dry'] ?? []),
                    array_keys($clientsMap['general'] ?? [])
                ))),
                'cold_clients' => count($clientsByType['cold']),
                'dry_clients' => count($clientsByType['dry']),
                'general_clients' => count($clientsByType['general']),
            ];

            // Get unread notification count
            $unreadNotifications = Notification::where('user_id', $vendorId)->unread()->count();

            return Inertia::render('Web/home/vendors/warehouse/Client', [
                'clients' => $clientsByType,
                'currentFilter' => $filter,
                'stats' => $stats,
                'vendorUser' => [
                    'name' => $vendor?->name ?? 'Vendor',
                    'role' => 'Warehouse Vendor',
                ],
                'unreadNotifications' => $unreadNotifications,
            ]);

        } catch (Throwable $e) {
            report($e);

            return Inertia::render('Web/home/vendors/warehouse/Client', [
                'clients' => [
                    'cold' => [],
                    'dry' => [],
                    'general' => [],
                ],
                'currentFilter' => 'all',
                'stats' => [
                    'total_clients' => 0,
                    'cold_clients' => 0,
                    'dry_clients' => 0,
                    'general_clients' => 0,
                ],
                'vendorUser' => [
                    'name' => Auth::user()?->name ?? 'Vendor',
                    'role' => 'Warehouse Vendor',
                ],
                'unreadNotifications' => 0,
                'server_error' => 'Failed to load client data. Check logs.',
            ]);
        }
    }
}
