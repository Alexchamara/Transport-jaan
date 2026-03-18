<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Models\VehicleReview;
use App\Models\Booking;
use App\Models\AirVehicleBookings;
use App\Models\SeaVehicleBookings;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class VehicleController extends Controller
{
    /**
     * Display a listing of vehicles with filtering options and dashboard analytics
     */
    public function index(Request $request)
    {
        $filters = $request->only(['category_type', 'approval_status', 'status', 'search', 'sort_by', 'sort_order']);

        $query = Vehicle::with(['category', 'provider', 'media' => function($query) {
            $query->where('media_type', 'image')->orderBy('sort_order')->orderBy('id');
        }]);

        if ($request->filled('category_type') && $request->category_type !== 'all') {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('type', $request->category_type);
            });
        }

        if ($request->filled('approval_status') && $request->approval_status !== 'all') {
            $query->where('approval_status', $request->approval_status);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('model', 'like', "%{$search}%")
                  ->orWhere('manufacturer', 'like', "%{$search}%")
                  ->orWhere('registration_number', 'like', "%{$search}%")
                  ->orWhereHas('provider', function($providerQuery) use ($search) {
                      $providerQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $validSortFields = ['created_at', 'model', 'manufacturer', 'approval_status', 'status', 'rental_price_per_day'];
        if (in_array($sortBy, $validSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $vehicles = $query->paginate(15)->withQueryString();

        $categories = VehicleCategory::select('type')->distinct()->get();

        $stats = $this->getVehicleStatistics();

        $dashboardData = $this->getDashboardAnalytics();

        return Inertia::render('Web/home/SuperAdmin/Vehicles', [
            'vehicles' => $vehicles,
            'categories' => $categories,
            'filters' => $filters,
            'stats' => $stats,
            'dashboardData' => $dashboardData,
        ]);
    }

    /**
     * Display vehicle details
     */
    public function show(Vehicle $vehicle)
    {
        $vehicle->load([
            'category',
            'provider',
            'media',
            'airSpec',
            'seaSpec',
            'landSpec',
            'policies',
            'reviews.client'
        ]);

        return Inertia::render('Web/home/SuperAdmin/VehicleDetails', [
            'vehicle' => $vehicle
        ]);
    }

    /**
     * Update vehicle approval status
     */
    public function updateApprovalStatus(Request $request, Vehicle $vehicle)
    {
        $request->validate([
            'approval_status' => 'required|in:pending,approved,rejected',
            'rejection_reason' => 'required_if:approval_status,rejected|nullable|string|max:500'
        ]);

        $vehicle->update([
            'approval_status' => $request->approval_status,
            'rejection_reason' => $request->rejection_reason
        ]);

        // You might want to send notification to the vehicle owner here
        // TODO: Implement notification system

        return redirect()->back()->with('success', 'Vehicle approval status updated successfully.');
    }

    /**
     * Bulk approve vehicles
     */
    public function bulkApprove(Request $request)
    {
        $request->validate([
            'vehicle_ids' => 'required|array',
            'vehicle_ids.*' => 'exists:vehicles,id'
        ]);

        Vehicle::whereIn('id', $request->vehicle_ids)
               ->update(['approval_status' => 'approved']);

        return redirect()->back()->with('success', 'Selected vehicles have been approved.');
    }

    /**
     * Bulk reject vehicles
     */
    public function bulkReject(Request $request)
    {
        $request->validate([
            'vehicle_ids' => 'required|array',
            'vehicle_ids.*' => 'exists:vehicles,id',
            'rejection_reason' => 'required|string|max:500'
        ]);

        Vehicle::whereIn('id', $request->vehicle_ids)
               ->update([
                   'approval_status' => 'rejected',
                   'rejection_reason' => $request->rejection_reason
               ]);

        return redirect()->back()->with('success', 'Selected vehicles have been rejected.');
    }

    /**
     * Update vehicle status (active/inactive)
     */
    public function updateStatus(Request $request, Vehicle $vehicle)
    {
        $request->validate([
            'status' => 'required|in:active,inactive'
        ]);

        $vehicle->update(['status' => $request->status]);

        return redirect()->back()->with('success', 'Vehicle status updated successfully.');
    }

    /**
     * Delete vehicle
     */
    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();

        return redirect()->back()->with('success', 'Vehicle deleted successfully.');
    }

    /**
     * Get vehicle statistics for dashboard
     */
    private function getVehicleStatistics()
    {
        $totalVehicles = Vehicle::count();
        $pendingApproval = Vehicle::where('approval_status', 'pending')->count();
        $approvedVehicles = Vehicle::where('approval_status', 'approved')->count();
        $rejectedVehicles = Vehicle::where('approval_status', 'rejected')->count();
        $activeVehicles = Vehicle::where('status', 'active')->count();

        // Vehicles by category
        $vehiclesByCategory = VehicleCategory::withCount('vehicles')
            ->get()
            ->groupBy('type')
            ->map(function($categories) {
                return $categories->sum('vehicles_count');
            });

        return [
            'total' => $totalVehicles,
            'pending_approval' => $pendingApproval,
            'approved' => $approvedVehicles,
            'rejected' => $rejectedVehicles,
            'active' => $activeVehicles,
            'by_category' => $vehiclesByCategory
        ];
    }

    /**
     * Export vehicles data
     */
    public function export(Request $request)
    {
        $vehicles = Vehicle::with(['category', 'provider'])
            ->when($request->category_type, function($query, $categoryType) {
                $query->whereHas('category', function($q) use ($categoryType) {
                    $q->where('type', $categoryType);
                });
            })
            ->when($request->approval_status, function($query, $status) {
                $query->where('approval_status', $status);
            })
            ->get();

        return response()->json($vehicles);
    }

    /**
     * Comprehensive dashboard analytics across all vehicle types
     */
    private function getDashboardAnalytics()
    {
        try {
            $now = Carbon::now();
            $startOfMonth = $now->copy()->startOfMonth();
            $lastMonth = $now->copy()->subMonth();

            // --- Overview Stats ---
            $totalVehicles = Vehicle::count();
            $approvedVehicles = Vehicle::where('approval_status', 'approved')->count();
            $pendingVehicles = Vehicle::where('approval_status', 'pending')->count();
            $rejectedVehicles = Vehicle::where('approval_status', 'rejected')->count();
            $activeVehicles = Vehicle::where('status', 'active')->count();

            $landVehicles = Vehicle::where('type', 'land')->count();
            $airVehicles = Vehicle::where('type', 'air')->count();
            $seaVehicles = Vehicle::where('type', 'sea')->count();

            // Total bookings across all types
            $landBookings = Booking::count();
            $airBookings = AirVehicleBookings::count();
            $seaBookings = SeaVehicleBookings::count();
            $totalBookings = $landBookings + $airBookings + $seaBookings;

            // Active bookings
            $activeLand = Booking::where('status', 'confirmed')->count();
            $activeAir = AirVehicleBookings::where('status', 'confirmed')->count();
            $activeSea = SeaVehicleBookings::where('status', 'confirmed')->count();
            $activeBookings = $activeLand + $activeAir + $activeSea;

            // Pending bookings
            $pendingLand = Booking::where('status', 'pending')->count();
            $pendingAir = AirVehicleBookings::where('status', 'pending')->count();
            $pendingSea = SeaVehicleBookings::where('status', 'pending')->count();
            $pendingBookings = $pendingLand + $pendingAir + $pendingSea;

            // Cancelled bookings
            $cancelledLand = Booking::where('status', 'cancelled')->count();
            $cancelledAir = AirVehicleBookings::where('status', 'cancelled')->count();
            $cancelledSea = SeaVehicleBookings::where('status', 'cancelled')->count();
            $cancelledBookings = $cancelledLand + $cancelledAir + $cancelledSea;

            // Revenue calculations
            $landRevenue = Booking::whereIn('status', ['confirmed', 'completed'])->sum('total_amount') ?? 0;
            $airRevenue = AirVehicleBookings::whereIn('status', ['confirmed', 'completed'])->sum('total_amount') ?? 0;
            $seaRevenue = SeaVehicleBookings::whereIn('status', ['confirmed', 'completed'])->sum('total_amount') ?? 0;
            $totalRevenue = $landRevenue + $airRevenue + $seaRevenue;

            // Monthly revenue
            $monthlyLand = Booking::whereIn('status', ['confirmed', 'completed'])->where('created_at', '>=', $startOfMonth)->sum('total_amount') ?? 0;
            $monthlyAir = AirVehicleBookings::whereIn('status', ['confirmed', 'completed'])->where('created_at', '>=', $startOfMonth)->sum('total_amount') ?? 0;
            $monthlySea = SeaVehicleBookings::whereIn('status', ['confirmed', 'completed'])->where('created_at', '>=', $startOfMonth)->sum('total_amount') ?? 0;
            $monthlyRevenue = $monthlyLand + $monthlyAir + $monthlySea;

            // Last month revenue for comparison
            $lastMonthStart = $lastMonth->copy()->startOfMonth();
            $lastMonthEnd = $lastMonth->copy()->endOfMonth();
            $lastMonthLand = Booking::whereIn('status', ['confirmed', 'completed'])->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->sum('total_amount') ?? 0;
            $lastMonthAir = AirVehicleBookings::whereIn('status', ['confirmed', 'completed'])->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->sum('total_amount') ?? 0;
            $lastMonthSea = SeaVehicleBookings::whereIn('status', ['confirmed', 'completed'])->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->sum('total_amount') ?? 0;
            $lastMonthRevenue = $lastMonthLand + $lastMonthAir + $lastMonthSea;

            $revenueChange = $lastMonthRevenue > 0
                ? round((($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
                : ($monthlyRevenue > 0 ? 100 : 0);

            // This month vs last month bookings
            $thisMonthBookings = Booking::where('created_at', '>=', $startOfMonth)->count()
                + AirVehicleBookings::where('created_at', '>=', $startOfMonth)->count()
                + SeaVehicleBookings::where('created_at', '>=', $startOfMonth)->count();
            $lastMonthBookingsCount = Booking::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count()
                + AirVehicleBookings::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count()
                + SeaVehicleBookings::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
            $bookingsChange = $lastMonthBookingsCount > 0
                ? round((($thisMonthBookings - $lastMonthBookingsCount) / $lastMonthBookingsCount) * 100, 1)
                : ($thisMonthBookings > 0 ? 100 : 0);

            // Reviews
            $avgRating = VehicleReview::avg('rating') ?? 0;
            $totalReviews = VehicleReview::count();

            // --- Booking Trends (last 12 months, all types combined) ---
            $bookingTrends = [];
            for ($i = 11; $i >= 0; $i--) {
                $month = $now->copy()->subMonths($i);
                $monthStart = $month->copy()->startOfMonth();
                $monthEnd = $month->copy()->endOfMonth();

                $confirmed = Booking::where('status', 'confirmed')->whereBetween('created_at', [$monthStart, $monthEnd])->count()
                    + AirVehicleBookings::where('status', 'confirmed')->whereBetween('created_at', [$monthStart, $monthEnd])->count()
                    + SeaVehicleBookings::where('status', 'confirmed')->whereBetween('created_at', [$monthStart, $monthEnd])->count();
                $pending = Booking::where('status', 'pending')->whereBetween('created_at', [$monthStart, $monthEnd])->count()
                    + AirVehicleBookings::where('status', 'pending')->whereBetween('created_at', [$monthStart, $monthEnd])->count()
                    + SeaVehicleBookings::where('status', 'pending')->whereBetween('created_at', [$monthStart, $monthEnd])->count();
                $cancelled = Booking::where('status', 'cancelled')->whereBetween('created_at', [$monthStart, $monthEnd])->count()
                    + AirVehicleBookings::where('status', 'cancelled')->whereBetween('created_at', [$monthStart, $monthEnd])->count()
                    + SeaVehicleBookings::where('status', 'cancelled')->whereBetween('created_at', [$monthStart, $monthEnd])->count();

                $bookingTrends[] = [
                    'month' => $month->format('M'),
                    'year' => $month->format('Y'),
                    'confirmed' => $confirmed,
                    'pending' => $pending,
                    'cancelled' => $cancelled,
                    'total' => $confirmed + $pending + $cancelled,
                ];
            }

            // --- Revenue Trends (last 12 months) ---
            $revenueTrends = [];
            for ($i = 11; $i >= 0; $i--) {
                $month = $now->copy()->subMonths($i);
                $monthStart = $month->copy()->startOfMonth();
                $monthEnd = $month->copy()->endOfMonth();

                $rev = (Booking::whereIn('status', ['confirmed', 'completed'])->whereBetween('created_at', [$monthStart, $monthEnd])->sum('total_amount') ?? 0)
                    + (AirVehicleBookings::whereIn('status', ['confirmed', 'completed'])->whereBetween('created_at', [$monthStart, $monthEnd])->sum('total_amount') ?? 0)
                    + (SeaVehicleBookings::whereIn('status', ['confirmed', 'completed'])->whereBetween('created_at', [$monthStart, $monthEnd])->sum('total_amount') ?? 0);

                $revenueTrends[] = [
                    'month' => $month->format('M'),
                    'year' => $month->format('Y'),
                    'revenue' => round((float)$rev, 2),
                ];
            }

            // --- Revenue by Type (for stacked area chart) ---
            $revenueByType = [];
            for ($i = 11; $i >= 0; $i--) {
                $month = $now->copy()->subMonths($i);
                $monthStart = $month->copy()->startOfMonth();
                $monthEnd = $month->copy()->endOfMonth();

                $revenueByType[] = [
                    'month' => $month->format('M'),
                    'land' => round((float)(Booking::whereIn('status', ['confirmed', 'completed'])->whereBetween('created_at', [$monthStart, $monthEnd])->sum('total_amount') ?? 0), 2),
                    'air' => round((float)(AirVehicleBookings::whereIn('status', ['confirmed', 'completed'])->whereBetween('created_at', [$monthStart, $monthEnd])->sum('total_amount') ?? 0), 2),
                    'sea' => round((float)(SeaVehicleBookings::whereIn('status', ['confirmed', 'completed'])->whereBetween('created_at', [$monthStart, $monthEnd])->sum('total_amount') ?? 0), 2),
                ];
            }

            // --- Vehicle Type Distribution ---
            $typeDistribution = [
                ['type' => 'land', 'label' => 'Land Vehicles', 'count' => $landVehicles],
                ['type' => 'air', 'label' => 'Air Vehicles', 'count' => $airVehicles],
                ['type' => 'sea', 'label' => 'Sea Vehicles', 'count' => $seaVehicles],
            ];

            // --- Booking Status Distribution ---
            $statusDistribution = [];
            $statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
            foreach ($statuses as $s) {
                $cnt = Booking::where('status', $s)->count()
                    + AirVehicleBookings::where('status', $s)->count()
                    + SeaVehicleBookings::where('status', $s)->count();
                if ($cnt > 0) {
                    $statusDistribution[] = ['status' => $s, 'count' => $cnt];
                }
            }

            // --- Bookings by Type ---
            $bookingsByType = [
                ['type' => 'Land', 'count' => $landBookings, 'revenue' => round((float)$landRevenue, 2)],
                ['type' => 'Air', 'count' => $airBookings, 'revenue' => round((float)$airRevenue, 2)],
                ['type' => 'Sea', 'count' => $seaBookings, 'revenue' => round((float)$seaRevenue, 2)],
            ];

            // --- Top Performing Vehicles ---
            $topVehicles = Vehicle::with(['provider:id,name', 'category:id,type'])
                ->where('approval_status', 'approved')
                ->get()
                ->map(function ($vehicle) {
                    $bookingCount = Booking::where('vehicle_id', $vehicle->id)->count()
                        + AirVehicleBookings::where('vehicle_id', $vehicle->id)->count()
                        + SeaVehicleBookings::where('vehicle_id', $vehicle->id)->count();
                    $revenue = (Booking::where('vehicle_id', $vehicle->id)->whereIn('status', ['confirmed', 'completed'])->sum('total_amount') ?? 0)
                        + (AirVehicleBookings::where('vehicle_id', $vehicle->id)->whereIn('status', ['confirmed', 'completed'])->sum('total_amount') ?? 0)
                        + (SeaVehicleBookings::where('vehicle_id', $vehicle->id)->whereIn('status', ['confirmed', 'completed'])->sum('total_amount') ?? 0);
                    $avgRating = VehicleReview::where('vehicle_id', $vehicle->id)->avg('rating') ?? 0;
                    $reviewCount = VehicleReview::where('vehicle_id', $vehicle->id)->count();

                    return [
                        'id' => $vehicle->id,
                        'name' => $vehicle->manufacturer . ' ' . $vehicle->model,
                        'type' => $vehicle->type,
                        'owner' => $vehicle->provider->name ?? 'N/A',
                        'bookings' => $bookingCount,
                        'revenue' => round((float)$revenue, 2),
                        'rating' => round((float)$avgRating, 1),
                        'reviews_count' => $reviewCount,
                    ];
                })
                ->sortByDesc('revenue')
                ->take(5)
                ->values()
                ->toArray();

            // --- Recent Bookings (across all types) ---
            $recentLand = Booking::with(['client:id,name,email', 'vehicle:id,model,manufacturer,type'])
                ->latest()->take(10)->get()->map(fn($b) => $this->formatBookingEntry($b, 'Land'));
            $recentAir = AirVehicleBookings::with(['client:id,name,email', 'vehicle:id,model,manufacturer,type'])
                ->latest()->take(10)->get()->map(fn($b) => $this->formatBookingEntry($b, 'Air'));
            $recentSea = SeaVehicleBookings::with(['client:id,name,email', 'vehicle:id,model,manufacturer,type'])
                ->latest()->take(10)->get()->map(fn($b) => $this->formatBookingEntry($b, 'Sea'));

            $recentBookings = $recentLand->concat($recentAir)->concat($recentSea)
                ->sortByDesc('created_at_raw')
                ->take(10)
                ->values()
                ->toArray();

            // --- Pending Vehicle Approvals ---
            $pendingApprovals = Vehicle::with(['provider:id,name,email', 'category:id,type'])
                ->where('approval_status', 'pending')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($v) => [
                    'id' => $v->id,
                    'name' => $v->manufacturer . ' ' . $v->model,
                    'type' => $v->type,
                    'owner' => $v->provider->name ?? 'N/A',
                    'owner_email' => $v->provider->email ?? 'N/A',
                    'price_per_day' => round((float)($v->rental_price_per_day ?? 0), 2),
                    'created_at' => $v->created_at->format('M d, Y'),
                ])
                ->toArray();

            // --- Cancellation Analytics ---
            $totalCancellations = $cancelledBookings;
            $totalRefunded = (Booking::where('status', 'cancelled')->sum('refund_amount') ?? 0);

            // --- Manufacturer Distribution ---
            $manufacturerDistribution = Vehicle::select('manufacturer', DB::raw('count(*) as count'))
                ->whereNotNull('manufacturer')
                ->groupBy('manufacturer')
                ->orderByDesc('count')
                ->take(8)
                ->get()
                ->map(fn($item) => [
                    'manufacturer' => $item->manufacturer,
                    'count' => $item->count,
                ])
                ->toArray();

            return [
                'overview' => [
                    'totalVehicles' => $totalVehicles,
                    'approvedVehicles' => $approvedVehicles,
                    'pendingVehicles' => $pendingVehicles,
                    'rejectedVehicles' => $rejectedVehicles,
                    'activeVehicles' => $activeVehicles,
                    'landVehicles' => $landVehicles,
                    'airVehicles' => $airVehicles,
                    'seaVehicles' => $seaVehicles,
                    'totalBookings' => $totalBookings,
                    'activeBookings' => $activeBookings,
                    'pendingBookings' => $pendingBookings,
                    'cancelledBookings' => $cancelledBookings,
                    'totalRevenue' => round((float)$totalRevenue, 2),
                    'monthlyRevenue' => round((float)$monthlyRevenue, 2),
                    'revenueChange' => $revenueChange,
                    'bookingsChange' => $bookingsChange,
                    'avgRating' => round((float)$avgRating, 1),
                    'totalReviews' => $totalReviews,
                ],
                'bookingTrends' => $bookingTrends,
                'revenueTrends' => $revenueTrends,
                'revenueByType' => $revenueByType,
                'typeDistribution' => $typeDistribution,
                'statusDistribution' => $statusDistribution,
                'bookingsByType' => $bookingsByType,
                'topVehicles' => $topVehicles,
                'recentBookings' => $recentBookings,
                'pendingApprovals' => $pendingApprovals,
                'cancellationAnalytics' => [
                    'totalCancellations' => $totalCancellations,
                    'totalRefunded' => round((float)$totalRefunded, 2),
                ],
                'manufacturerDistribution' => $manufacturerDistribution,
            ];
        } catch (\Exception $e) {
            Log::error('Vehicle dashboard analytics error: ' . $e->getMessage());
            return $this->getEmptyDashboardData();
        }
    }

    private function formatBookingEntry($booking, string $vehicleType): array
    {
        return [
            'id' => $booking->id,
            'vehicle_type' => $vehicleType,
            'customer' => $booking->client->name ?? 'N/A',
            'email' => $booking->client->email ?? 'N/A',
            'vehicle' => ($booking->vehicle->manufacturer ?? '') . ' ' . ($booking->vehicle->model ?? ''),
            'status' => $booking->status,
            'amount' => round((float)($booking->total_amount ?? 0), 2),
            'rental_days' => $booking->rental_days ?? 0,
            'created_at' => $booking->created_at->format('M d, Y H:i'),
            'created_at_raw' => $booking->created_at->toIso8601String(),
        ];
    }

    private function getEmptyDashboardData(): array
    {
        return [
            'overview' => [
                'totalVehicles' => 0, 'approvedVehicles' => 0, 'pendingVehicles' => 0,
                'rejectedVehicles' => 0, 'activeVehicles' => 0,
                'landVehicles' => 0, 'airVehicles' => 0, 'seaVehicles' => 0,
                'totalBookings' => 0, 'activeBookings' => 0, 'pendingBookings' => 0,
                'cancelledBookings' => 0, 'totalRevenue' => 0, 'monthlyRevenue' => 0,
                'revenueChange' => 0, 'bookingsChange' => 0,
                'avgRating' => 0, 'totalReviews' => 0,
            ],
            'bookingTrends' => [],
            'revenueTrends' => [],
            'revenueByType' => [],
            'typeDistribution' => [],
            'statusDistribution' => [],
            'bookingsByType' => [],
            'topVehicles' => [],
            'recentBookings' => [],
            'pendingApprovals' => [],
            'cancellationAnalytics' => ['totalCancellations' => 0, 'totalRefunded' => 0],
            'manufacturerDistribution' => [],
        ];
    }
}
