<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class VendorUserController extends Controller
{
    /**
     * Display vendors with filtering options
     */
    public function index(Request $request)
    {
        // Get all vendor users and categorize them by status
        $allVendors = User::where('role', 'vendor')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? 'N/A',
                    'regDate' => $user->created_at->format('Y-m-d'),
                    'status' => $user->status,
                    'approval' => $user->status, // For component compatibility
                    'created_at' => $user->created_at->diffForHumans(),
                ];
            });

        // Categorize vendors by status
        $newVendors = $allVendors->where('status', 'unverified');
        $verifiedVendors = $allVendors->where('status', 'verified');
        $blockedVendors = $allVendors->whereIn('status', ['blocked', 'rejected']);

        // Check if this is an API request
        if ($request->wantsJson() || $request->is('api/*')) {
            $statusFilter = $request->get('status', 'all');

            switch ($statusFilter) {
                case 'verified':
                    $vendors = $verifiedVendors;
                    break;
                case 'unverified':
                case 'new':
                    $vendors = $newVendors;
                    break;
                case 'blocked':
                    $vendors = $blockedVendors;
                    break;
                default:
                    $vendors = $allVendors;
                    break;
            }

            return response()->json([
                'vendors' => $vendors->values(),
                'total' => $vendors->count(),
                'statusFilter' => $statusFilter
            ]);
        }

        // Return Inertia response for web interface
        return Inertia::render('Web/home/SuperAdmin/Vender', [
            'newVendors' => $newVendors->values(),
            'verifiedVendors' => $verifiedVendors->values(),
            'blockedVendors' => $blockedVendors->values(),
            'totalVendors' => $allVendors->count(),
        ]);
    }

    /**
     * Verify a vendor user
     */
    public function verify(Request $request, User $user)
    {
        if ($user->role !== 'vendor') {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'User is not a vendor'], 400);
            }
            return redirect()->back()->with('error', 'User is not a vendor');
        }

        $user->update(['status' => 'verified']);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Vendor verified successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => ucfirst($user->status),
                ]
            ]);
        }

        return redirect()->back()->with('success', 'Vendor verified successfully');
    }

    /**
     * Block a vendor user
     */
    public function block(Request $request, User $user)
    {
        if ($user->role !== 'vendor') {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'User is not a vendor'], 400);
            }
            return redirect()->back()->with('error', 'User is not a vendor');
        }

        $user->update(['status' => 'blocked']);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Vendor blocked successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => ucfirst($user->status),
                ]
            ]);
        }

        return redirect()->back()->with('success', 'Vendor blocked successfully');
    }

    /**
     * Unblock a vendor user
     */
    public function unblock(Request $request, User $user)
    {
        if ($user->role !== 'vendor') {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'User is not a vendor'], 400);
            }
            return redirect()->back()->with('error', 'User is not a vendor');
        }

        $user->update(['status' => 'verified']);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Vendor unblocked successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => ucfirst($user->status),
                ]
            ]);
        }

        return redirect()->back()->with('success', 'Vendor unblocked successfully');
    }

    /**
     * Reject a vendor user
     */
    public function reject(Request $request, User $user)
    {
        if ($user->role !== 'vendor') {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'User is not a vendor'], 400);
            }
            return redirect()->back()->with('error', 'User is not a vendor');
        }

        $user->update(['status' => 'rejected']);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Vendor rejected successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => ucfirst($user->status),
                ]
            ]);
        }

        return redirect()->back()->with('success', 'Vendor rejected successfully');
    }
}
