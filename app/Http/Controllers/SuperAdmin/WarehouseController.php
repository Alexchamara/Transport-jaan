<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Warehouse\WarehouseUnit;
use App\Models\Warehouse\WarehouseBooking;
use App\Models\Warehouse\WarehouseApproval;
use App\Models\Warehouse\WarehouseReview;
use App\Models\WarehouseBookingCancellation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class WarehouseController extends Controller
{
    /**
     * Display warehouse management page with dashboard analytics
     */
    public function index(Request $request)
    {
        try {
            $search = $request->get('search');
            $typeFilter = $request->get('type_filter');
            $statusFilter = $request->get('status_filter');

            // Build query for warehouse units
            $query = WarehouseUnit::query();

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('address', 'like', "%{$search}%")
                      ->orWhereHas('owner', function ($ownerQ) use ($search) {
                          $ownerQ->where('name', 'like', "%{$search}%")
                                 ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            if ($typeFilter && $typeFilter !== 'all') {
                $query->where('type', '=', trim($typeFilter));
            }

            if ($statusFilter && $statusFilter !== 'all') {
                $query->where(function ($q) use ($statusFilter) {
                    $q->whereHas('currentApproval', function ($subQ) use ($statusFilter) {
                        $subQ->where('status', trim($statusFilter));
                    });
                    if (trim($statusFilter) === 'pending') {
                        $q->orWhereDoesntHave('approvals');
                    }
                });
            }

            $query->with(['owner:id,name,email', 'currentApproval']);

            $warehouses = $query->latest()
                ->paginate(10)
                ->withQueryString();

            $warehouses->getCollection()->transform(function ($warehouse) {
                $status = $warehouse->currentApproval ? $warehouse->currentApproval->status : 'pending';
                return [
                    'id' => $warehouse->id,
                    'name' => $warehouse->name,
                    'location' => $warehouse->address ?? 'N/A',
                    'capacity' => number_format($warehouse->capacity ?? 0, 0),
                    'total_area' => number_format($warehouse->total_area ?? 0, 0),
                    'type' => $warehouse->type,
                    'status' => $status,
                    'owner_name' => $warehouse->owner->name ?? 'N/A',
                    'owner_email' => $warehouse->owner->email ?? 'N/A',
                    'is_active' => $warehouse->is_active,
                    'is_available' => $warehouse->is_available,
                    'created_at' => $warehouse->created_at->format('Y-m-d H:i'),
                    'updated_at' => $warehouse->updated_at->format('Y-m-d H:i'),
                    'pricing' => [
                        'base_price' => $warehouse->base_price ?? 0,
                        'monthly_rate' => $warehouse->monthly_rate ?? 0,
                        'currency' => $warehouse->currency ?? 'USD'
                    ],
                    'contact' => [
                        'person' => $warehouse->contact_person ?? 'N/A',
                        'phone' => $warehouse->contact_phone ?? 'N/A',
                        'email' => $warehouse->contact_email ?? 'N/A'
                    ]
                ];
            });

            // Dashboard analytics data
            $dashboardData = $this->getDashboardData();

            return Inertia::render('Web/home/SuperAdmin/Warehouse', [
                'warehouses' => $warehouses,
                'filters' => [
                    'search' => $search,
                    'type_filter' => $typeFilter,
                    'status_filter' => $statusFilter
                ],
                'dashboardData' => $dashboardData,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching warehouses: ' . $e->getMessage());

            return Inertia::render('Web/home/SuperAdmin/Warehouse', [
                'warehouses' => [],
                'filters' => [],
                'dashboardData' => $this->getEmptyDashboardData(),
                'error' => 'Failed to load warehouse data'
            ]);
        }
    }

    /**
     * Comprehensive dashboard analytics
     */
    private function getDashboardData()
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $lastMonth = $now->copy()->subMonth();

        // --- Overview Stats ---
        $totalUnits = WarehouseUnit::count();
        $approvedUnits = WarehouseUnit::whereHas('currentApproval', fn($q) => $q->where('status', 'approved'))->count();
        $pendingUnits = WarehouseUnit::where(function ($q) {
            $q->whereHas('currentApproval', fn($sq) => $sq->where('status', 'pending'))
              ->orWhereDoesntHave('approvals');
        })->count();
        $suspendedUnits = WarehouseUnit::whereHas('currentApproval', fn($q) => $q->where('status', 'suspended'))->count();
        $rejectedUnits = WarehouseUnit::whereHas('currentApproval', fn($q) => $q->where('status', 'rejected'))->count();

        $totalBookings = WarehouseBooking::count();
        $activeBookings = WarehouseBooking::where('status', 'confirmed')->count();
        $pendingBookings = WarehouseBooking::where('status', 'pending')->count();
        $cancelledBookings = WarehouseBooking::where('status', 'cancelled')->count();

        $totalRevenue = WarehouseBooking::where('payment_status', 'paid')->sum('final_amount') ?? 0;
        $monthlyRevenue = WarehouseBooking::where('payment_status', 'paid')
            ->where('created_at', '>=', $startOfMonth)
            ->sum('final_amount') ?? 0;
        $lastMonthRevenue = WarehouseBooking::where('payment_status', 'paid')
            ->whereBetween('created_at', [$lastMonth->copy()->startOfMonth(), $lastMonth->copy()->endOfMonth()])
            ->sum('final_amount') ?? 0;

        $revenueChange = $lastMonthRevenue > 0
            ? round((($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : ($monthlyRevenue > 0 ? 100 : 0);

        $thisMonthBookings = WarehouseBooking::where('created_at', '>=', $startOfMonth)->count();
        $lastMonthBookings = WarehouseBooking::whereBetween('created_at', [$lastMonth->copy()->startOfMonth(), $lastMonth->copy()->endOfMonth()])->count();
        $bookingsChange = $lastMonthBookings > 0
            ? round((($thisMonthBookings - $lastMonthBookings) / $lastMonthBookings) * 100, 1)
            : ($thisMonthBookings > 0 ? 100 : 0);

        $occupancyRate = $totalUnits > 0 ? round(($approvedUnits / $totalUnits) * 100, 1) : 0;

        $avgRating = WarehouseReview::where('is_active', true)->avg('rating') ?? 0;
        $totalReviews = WarehouseReview::where('is_active', true)->count();

        // --- Monthly Booking Trends (last 12 months) ---
        $bookingTrends = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();

            $confirmed = WarehouseBooking::where('status', 'confirmed')
                ->whereBetween('created_at', [$monthStart, $monthEnd])->count();
            $pending = WarehouseBooking::where('status', 'pending')
                ->whereBetween('created_at', [$monthStart, $monthEnd])->count();
            $cancelled = WarehouseBooking::where('status', 'cancelled')
                ->whereBetween('created_at', [$monthStart, $monthEnd])->count();

            $bookingTrends[] = [
                'month' => $month->format('M'),
                'year' => $month->format('Y'),
                'confirmed' => $confirmed,
                'pending' => $pending,
                'cancelled' => $cancelled,
                'total' => $confirmed + $pending + $cancelled,
            ];
        }

        // --- Monthly Revenue Trends (last 12 months) ---
        $revenueTrends = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();

            $revenue = WarehouseBooking::where('payment_status', 'paid')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('final_amount') ?? 0;

            $revenueTrends[] = [
                'month' => $month->format('M'),
                'year' => $month->format('Y'),
                'revenue' => round((float)$revenue, 2),
            ];
        }

        // --- Type Distribution ---
        $typeDistribution = WarehouseUnit::select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->get()
            ->map(fn($item) => [
                'type' => $item->type ?? 'unknown',
                'count' => $item->count,
                'label' => $this->formatTypeName($item->type),
            ])
            ->toArray();

        // --- Booking Status Distribution ---
        $statusDistribution = WarehouseBooking::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn($item) => [
                'status' => $item->status ?? 'unknown',
                'count' => $item->count,
            ])
            ->toArray();

        // --- Payment Status Distribution ---
        $paymentDistribution = WarehouseBooking::select('payment_status', DB::raw('count(*) as count'))
            ->groupBy('payment_status')
            ->get()
            ->map(fn($item) => [
                'status' => $item->payment_status ?? 'unknown',
                'count' => $item->count,
            ])
            ->toArray();

        // --- Top Performing Warehouses ---
        $topWarehouses = WarehouseUnit::withCount(['reviews'])
            ->with(['owner:id,name'])
            ->has('reviews')
            ->get()
            ->map(function ($unit) {
                $bookingCount = WarehouseBooking::where('warehouse_unit_id', $unit->id)->count();
                $revenue = WarehouseBooking::where('warehouse_unit_id', $unit->id)
                    ->where('payment_status', 'paid')
                    ->sum('final_amount') ?? 0;
                return [
                    'id' => $unit->id,
                    'name' => $unit->name,
                    'type' => $unit->type,
                    'owner' => $unit->owner->name ?? 'N/A',
                    'bookings' => $bookingCount,
                    'revenue' => round((float)$revenue, 2),
                    'rating' => round((float)$unit->averageRating(), 1),
                    'reviews_count' => $unit->reviews_count,
                ];
            })
            ->sortByDesc('revenue')
            ->take(5)
            ->values()
            ->toArray();

        // If no reviews exist, fallback to top by bookings
        if (empty($topWarehouses)) {
            $topWarehouses = WarehouseUnit::with(['owner:id,name'])
                ->get()
                ->map(function ($unit) {
                    $bookingCount = WarehouseBooking::where('warehouse_unit_id', $unit->id)->count();
                    $revenue = WarehouseBooking::where('warehouse_unit_id', $unit->id)
                        ->where('payment_status', 'paid')
                        ->sum('final_amount') ?? 0;
                    return [
                        'id' => $unit->id,
                        'name' => $unit->name,
                        'type' => $unit->type,
                        'owner' => $unit->owner->name ?? 'N/A',
                        'bookings' => $bookingCount,
                        'revenue' => round((float)$revenue, 2),
                        'rating' => 0,
                        'reviews_count' => 0,
                    ];
                })
                ->sortByDesc('bookings')
                ->take(5)
                ->values()
                ->toArray();
        }

        // --- Recent Bookings ---
        $recentBookings = WarehouseBooking::with(['user:id,name,email', 'warehouseUnit:id,name,type'])
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($b) => [
                'id' => $b->id,
                'reference' => $b->booking_reference,
                'customer' => $b->user->name ?? $b->company_name ?? 'N/A',
                'email' => $b->user->email ?? $b->company_email ?? 'N/A',
                'warehouse' => $b->warehouseUnit->name ?? 'N/A',
                'warehouse_type' => $b->warehouseUnit->type ?? 'N/A',
                'status' => $b->status,
                'payment_status' => $b->payment_status,
                'amount' => round((float)($b->final_amount ?? 0), 2),
                'start_date' => $b->start_date ? Carbon::parse($b->start_date)->format('M d, Y') : 'N/A',
                'end_date' => $b->end_date ? Carbon::parse($b->end_date)->format('M d, Y') : 'N/A',
                'created_at' => $b->created_at->format('M d, Y H:i'),
            ])
            ->toArray();

        // --- Pending Approvals ---
        $pendingApprovals = WarehouseUnit::with(['owner:id,name,email'])
            ->where(function ($q) {
                $q->whereHas('currentApproval', fn($sq) => $sq->where('status', 'pending'))
                  ->orWhereDoesntHave('approvals');
            })
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($w) => [
                'id' => $w->id,
                'name' => $w->name,
                'type' => $w->type,
                'owner' => $w->owner->name ?? 'N/A',
                'owner_email' => $w->owner->email ?? 'N/A',
                'created_at' => $w->created_at->format('M d, Y'),
            ])
            ->toArray();

        // --- Cancellation Analytics ---
        $totalCancellations = WarehouseBookingCancellation::count();
        $totalRefunded = WarehouseBookingCancellation::where('refund_status', 'completed')->sum('refund_amount') ?? 0;
        $pendingRefunds = WarehouseBookingCancellation::where('refund_status', 'pending')->count();

        // --- Storage Type Demand ---
        $storageTypeDemand = WarehouseBooking::select('storage_type', DB::raw('count(*) as demand'))
            ->whereNotNull('storage_type')
            ->groupBy('storage_type')
            ->orderByDesc('demand')
            ->get()
            ->map(fn($item) => [
                'type' => $item->storage_type,
                'demand' => $item->demand,
            ])
            ->toArray();

        return [
            'overview' => [
                'totalUnits' => $totalUnits,
                'approvedUnits' => $approvedUnits,
                'pendingUnits' => $pendingUnits,
                'suspendedUnits' => $suspendedUnits,
                'rejectedUnits' => $rejectedUnits,
                'totalBookings' => $totalBookings,
                'activeBookings' => $activeBookings,
                'pendingBookings' => $pendingBookings,
                'cancelledBookings' => $cancelledBookings,
                'totalRevenue' => round((float)$totalRevenue, 2),
                'monthlyRevenue' => round((float)$monthlyRevenue, 2),
                'revenueChange' => $revenueChange,
                'bookingsChange' => $bookingsChange,
                'occupancyRate' => $occupancyRate,
                'avgRating' => round((float)$avgRating, 1),
                'totalReviews' => $totalReviews,
            ],
            'bookingTrends' => $bookingTrends,
            'revenueTrends' => $revenueTrends,
            'typeDistribution' => $typeDistribution,
            'statusDistribution' => $statusDistribution,
            'paymentDistribution' => $paymentDistribution,
            'topWarehouses' => $topWarehouses,
            'recentBookings' => $recentBookings,
            'pendingApprovals' => $pendingApprovals,
            'cancellationAnalytics' => [
                'totalCancellations' => $totalCancellations,
                'totalRefunded' => round((float)$totalRefunded, 2),
                'pendingRefunds' => $pendingRefunds,
            ],
            'storageTypeDemand' => $storageTypeDemand,
        ];
    }

    private function getEmptyDashboardData()
    {
        return [
            'overview' => [
                'totalUnits' => 0, 'approvedUnits' => 0, 'pendingUnits' => 0,
                'suspendedUnits' => 0, 'rejectedUnits' => 0,
                'totalBookings' => 0, 'activeBookings' => 0, 'pendingBookings' => 0,
                'cancelledBookings' => 0, 'totalRevenue' => 0, 'monthlyRevenue' => 0,
                'revenueChange' => 0, 'bookingsChange' => 0, 'occupancyRate' => 0,
                'avgRating' => 0, 'totalReviews' => 0,
            ],
            'bookingTrends' => [],
            'revenueTrends' => [],
            'typeDistribution' => [],
            'statusDistribution' => [],
            'paymentDistribution' => [],
            'topWarehouses' => [],
            'recentBookings' => [],
            'pendingApprovals' => [],
            'cancellationAnalytics' => ['totalCancellations' => 0, 'totalRefunded' => 0, 'pendingRefunds' => 0],
            'storageTypeDemand' => [],
        ];
    }

    private function formatTypeName($type)
    {
        $map = [
            'cold_storage' => 'Cold Storage',
            'dry' => 'Dry Storage',
            'bonded' => 'Bonded Warehouse',
            'open_yard' => 'Open Yard',
            'climate_controlled' => 'Climate Controlled',
            'hazmat' => 'Hazmat Storage',
        ];
        return $map[$type] ?? ucfirst(str_replace('_', ' ', $type ?? 'Unknown'));
    }

    /**
     * Update warehouse status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:pending,approved,rejected,suspended'
            ]);

            $warehouse = WarehouseUnit::findOrFail($id);
            $newStatus = $request->status;

            // Create or update approval record
            $approval = WarehouseApproval::updateOrCreate(
                ['warehouse_unit_id' => $warehouse->id],
                [
                    'status' => $newStatus,
                    'reviewed_by' => Auth::id(),
                    'reviewed_at' => now(),
                    'notes' => $request->notes ?? "Status updated to {$newStatus} by admin",
                ]
            );

            // Update warehouse active status based on approval
            $warehouse->update([
                'is_active' => in_array($newStatus, ['approved']),
                'is_available' => in_array($newStatus, ['approved'])
            ]);

            // Log the action
            Log::info("Warehouse {$warehouse->id} status changed to {$newStatus} by user " . Auth::id());

            return redirect()->route('superadmin.Warehouse')->with('success', "Warehouse status updated to {$newStatus} successfully");

        } catch (\Exception $e) {
            Log::error('Error updating warehouse status: ' . $e->getMessage());

            return redirect()->route('superadmin.Warehouse')->with('error', 'Failed to update warehouse status');
        }
    }    /**
     * Get warehouse details
     */
    public function show($id)
    {
        try {
            $warehouse = WarehouseUnit::with([
                'owner:id,name,email',
                'currentApproval',
                'amenities',
                'images',
                'documents'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $warehouse->id,
                    'name' => $warehouse->name,
                    'description' => $warehouse->description,
                    'address' => $warehouse->address,
                    'latitude' => $warehouse->latitude,
                    'longitude' => $warehouse->longitude,
                    'total_area' => $warehouse->total_area,
                    'capacity' => $warehouse->capacity,
                    'capacity_unit' => $warehouse->capacity_unit,
                    'type' => $warehouse->type,
                    'status' => $warehouse->currentApproval ? $warehouse->currentApproval->status : 'pending',
                    'is_active' => $warehouse->is_active,
                    'is_available' => $warehouse->is_available,
                    'owner' => $warehouse->owner,
                    'pricing' => [
                        'pricing_model' => $warehouse->pricing_model,
                        'base_price' => $warehouse->base_price,
                        'monthly_rate' => $warehouse->monthly_rate,
                        'security_deposit' => $warehouse->security_deposit,
                        'setup_fee' => $warehouse->setup_fee,
                        'currency' => $warehouse->currency
                    ],
                    'contact' => [
                        'person' => $warehouse->contact_person,
                        'phone' => $warehouse->contact_phone,
                        'email' => $warehouse->contact_email
                    ],
                    'amenities' => $warehouse->amenities,
                    'images' => $warehouse->images,
                    'documents' => $warehouse->documents,
                    'created_at' => $warehouse->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $warehouse->updated_at->format('Y-m-d H:i:s')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Warehouse not found'
            ], 404);
        }
    }
}
