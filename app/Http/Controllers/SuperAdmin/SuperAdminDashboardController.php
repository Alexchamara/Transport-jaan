<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class SuperAdminDashboardController extends Controller
{
    /**
     * Display the super admin dashboard.
     */
    public function index()
    {
        // Get user statistics
        $userStats = $this->getUserStatistics();

        return Inertia::render('Web/home/SuperAdmin/Dashboard', [
            'userStats' => $userStats
        ]);
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
}
