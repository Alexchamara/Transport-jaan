<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Booking;
use App\Models\FlightBooking;
use App\Models\SeaVehicleBookings;
use App\Models\VendorProfile;
use App\Models\VendorServiceRegistration;
use App\Models\Warehouse\WarehouseBooking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SuperAdminDashboardController extends Controller
{
    /**
     * Display the super admin dashboard.
     */
    public function index()
    {
        // Get user statistics
        $userStats = $this->getUserStatistics();
        
        // Get booking data
        $landBookings = $this->getLandBookings();
        $airBookings = $this->getAirBookings();
        $seaBookings = $this->getSeaBookings();
        $warehouseBookings = $this->getWarehouseBookings();

        return Inertia::render('Web/home/SuperAdmin/Dashboard', [
            'userStats' => $userStats,
            'landBookings' => $landBookings,
            'airBookings' => $airBookings,
            'seaBookings' => $seaBookings,
            'warehouseBookings' => $warehouseBookings,
            'pendingVendorReviews' => $this->getPendingVendorReviews(),
        ]);
    }

    /**
     * Get land vehicle bookings
     */
    private function getLandBookings()
    {
        return Booking::with(['customer', 'schedule'])
            ->select('id', 'status', 'total_amount', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_reference' => 'LV-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                    'status' => $booking->status,
                    'final_amount' => (float)$booking->total_amount,
                    'payment_status' => 'paid',
                    'created_at' => $booking->created_at,
                    'customer' => $booking->customer ? [
                        'name' => $booking->customer->first_name . ' ' . $booking->customer->last_name,
                        'email' => $booking->customer->email,
                        'phone' => $booking->customer->phone,
                    ] : null,
                    'schedule' => $booking->schedule ? [
                        'pickup_location' => $booking->schedule->pickup_location,
                        'dropoff_location' => $booking->schedule->dropoff_location,
                        'pickup_date' => $booking->schedule->pickup_at,
                        'dropoff_date' => $booking->schedule->dropoff_at,
                    ] : null,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get air vehicle bookings
     */
    private function getAirBookings()
    {
        return FlightBooking::select('id', 'booking_reference', 'status', 'created_at', 'name', 'email', 'phone', 'departure_airport', 'arriving_airport')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_reference' => $booking->booking_reference ?? 'FB-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                    'status' => $booking->status,
                    'final_amount' => 0,
                    'payment_status' => 'pending',
                    'created_at' => $booking->created_at,
                    'customer' => [
                        'name' => $booking->name,
                        'email' => $booking->email,
                        'phone' => $booking->phone,
                    ],
                    'route' => [
                        'from' => $booking->departure_airport,
                        'to' => $booking->arriving_airport,
                    ]
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get sea vehicle bookings
     */
    private function getSeaBookings()
    {
        return SeaVehicleBookings::with(['customer', 'schedule'])
            ->select('id', 'client_id', 'status', 'total_amount', 'price_per_day', 'rental_days', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_reference' => 'SV-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                    'status' => $booking->status,
                    'final_amount' => (float)$booking->total_amount,
                    'payment_status' => 'paid',
                    'created_at' => $booking->created_at,
                    'customer' => $booking->customer ? [
                        'name' => $booking->customer->first_name . ' ' . $booking->customer->last_name,
                        'email' => $booking->customer->email,
                        'phone' => $booking->customer->phone,
                    ] : null,
                    'schedule' => $booking->schedule ? [
                        'pickup_location' => $booking->schedule->pickup_location,
                        'dropoff_location' => $booking->schedule->dropoff_location,
                        'pickup_date' => $booking->schedule->pickup_at,
                        'dropoff_date' => $booking->schedule->dropoff_at,
                    ] : null,
                    'price_per_day' => (float)$booking->price_per_day,
                    'rental_days' => $booking->rental_days,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get warehouse bookings
     */
    private function getWarehouseBookings()
    {
        return WarehouseBooking::select(
            'id', 'booking_reference', 'status', 'final_amount', 'payment_status', 
            'company_name', 'contact_person', 'email', 'phone', 'company_address',
            'storage_type', 'goods_type', 'required_space', 'estimated_weight', 'goods_description',
            'start_date', 'end_date', 'duration_months', 'monthly_rate',
            'setup_fee', 'security_deposit', 'total_amount', 'tax_amount',
            'payment_method', 'payment_date', 'transaction_reference',
            'special_requirements', 'special_instructions', 'amenities', 'access_hours', 'notes',
            'created_at', 'updated_at'
        )
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_reference' => $booking->booking_reference,
                    'status' => $booking->status,
                    'final_amount' => (float)$booking->final_amount,
                    'total_amount' => (float)$booking->total_amount,
                    'payment_status' => $booking->payment_status,
                    'company_name' => $booking->company_name,
                    'contact_person' => $booking->contact_person,
                    'email' => $booking->email,
                    'phone' => $booking->phone,
                    'company_address' => $booking->company_address,
                    'storage_type' => $booking->storage_type,
                    'goods_type' => $booking->goods_type,
                    'required_space' => (float)$booking->required_space,
                    'estimated_weight' => (float)$booking->estimated_weight,
                    'goods_description' => $booking->goods_description,
                    'start_date' => $booking->start_date,
                    'end_date' => $booking->end_date,
                    'duration_months' => $booking->duration_months,
                    'monthly_rate' => (float)$booking->monthly_rate,
                    'setup_fee' => (float)$booking->setup_fee,
                    'security_deposit' => (float)$booking->security_deposit,
                    'tax_amount' => (float)$booking->tax_amount,
                    'payment_method' => $booking->payment_method,
                    'payment_date' => $booking->payment_date,
                    'transaction_reference' => $booking->transaction_reference,
                    'special_requirements' => $booking->special_requirements,
                    'special_instructions' => $booking->special_instructions,
                    'amenities' => $booking->amenities,
                    'access_hours' => $booking->access_hours,
                    'notes' => $booking->notes,
                    'created_at' => $booking->created_at,
                    'updated_at' => $booking->updated_at,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get user statistics for dashboard cards
     */
    private function getUserStatistics()
    {
        $now = Carbon::now();
        $currentMonth = $now->startOfMonth();
        $lastMonth = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        // Monthly users (users created this month)
        $monthlyUsers = User::whereBetween('created_at', [$currentMonth, $now])->count();

        // Last month users for comparison
        $lastMonthUsers = User::whereBetween('created_at', [$lastMonth, $lastMonthEnd])->count();

        // Calculate monthly growth percentage
        $monthlyGrowth = 0;
        if ($lastMonthUsers > 0) {
            $monthlyGrowth = (($monthlyUsers - $lastMonthUsers) / $lastMonthUsers) * 100;
        } elseif ($monthlyUsers > 0) {
            $monthlyGrowth = 100; // 100% growth if no users last month but have users this month
        }

        // New signups (users created in last 7 days)
        $weekAgo = $now->copy()->subDays(7);
        $newSignups = User::where('created_at', '>=', $weekAgo)->count();

        // Previous week signups for comparison
        $twoWeeksAgo = $now->copy()->subDays(14);
        $previousWeekSignups = User::whereBetween('created_at', [$twoWeeksAgo, $weekAgo])->count();

        // Calculate signup growth percentage
        $signupGrowth = 0;
        if ($previousWeekSignups > 0) {
            $signupGrowth = (($newSignups - $previousWeekSignups) / $previousWeekSignups) * 100;
        } elseif ($newSignups > 0) {
            $signupGrowth = 100;
        }

        // Total users
        $totalUsers = User::count();

        return [
            'monthlyUsers' => $monthlyUsers,
            'monthlyGrowth' => round($monthlyGrowth, 1),
            'newSignups' => $newSignups,
            'signupGrowth' => round($signupGrowth, 1),
            'totalUsers' => $totalUsers,
            'isMonthlyGrowthPositive' => $monthlyGrowth >= 0,
            'isSignupGrowthPositive' => $signupGrowth >= 0,
        ];
    }

    private function getPendingVendorReviews()
    {
        $pendingProfiles = VendorProfile::where('submission_status', 'submitted')->count();
        $pendingServices = VendorServiceRegistration::where('status', 'submitted')->count();

        $profileSubmissions = VendorProfile::where('submission_status', 'submitted')
            ->with('user:id,name,email')
            ->orderBy('submitted_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($profile) => [
                'id' => $profile->user_id,
                'name' => $profile->user->name ?? 'N/A',
                'company' => $profile->company_name,
                'type' => 'profile',
                'label' => 'Business Profile',
                'submitted_at_raw' => $profile->submitted_at ?? $profile->created_at,
            ]);

        $serviceSubmissions = VendorServiceRegistration::where('status', 'submitted')
            ->with(['user:id,name,email', 'serviceCategory:id,name'])
            ->orderBy('submitted_at', 'desc')
            ->limit(20)
            ->get()
            ->map(fn($registration) => [
                'id' => $registration->user_id,
                'name' => $registration->user->name ?? 'N/A',
                'company' => null,
                'type' => 'service',
                'label' => $registration->serviceCategory?->name ?? 'Service Registration',
                'submitted_at_raw' => $registration->submitted_at ?? $registration->created_at,
            ]);

        $recentSubmissions = $profileSubmissions
            ->concat($serviceSubmissions)
            ->groupBy('id')
            ->map(function ($items, $vendorId) {
                $first = $items->first();
                $hasProfile = $items->contains(fn($item) => $item['type'] === 'profile');
                $serviceLabels = $items
                    ->filter(fn($item) => $item['type'] === 'service')
                    ->pluck('label')
                    ->filter()
                    ->unique()
                    ->values()
                    ->toArray();

                $latestSubmittedAt = $items->max('submitted_at_raw');

                return [
                    'key' => 'vendor-' . $vendorId,
                    'id' => (int) $vendorId,
                    'name' => $first['name'] ?? 'N/A',
                    'company' => $items->pluck('company')->filter()->first(),
                    'hasProfile' => $hasProfile,
                    'serviceLabels' => $serviceLabels,
                    'serviceCount' => count($serviceLabels),
                    'submitted_at' => $latestSubmittedAt?->diffForHumans(),
                    'submitted_at_raw' => $latestSubmittedAt,
                ];
            })
            ->sortByDesc('submitted_at_raw')
            ->values()
            ->take(10)
            ->map(fn($item) => collect($item)->except(['submitted_at_raw'])->toArray())
            ->toArray();

        return [
            'pendingProfiles' => $pendingProfiles,
            'pendingServices' => $pendingServices,
            'recentSubmissions' => $recentSubmissions,
        ];
    }
}
