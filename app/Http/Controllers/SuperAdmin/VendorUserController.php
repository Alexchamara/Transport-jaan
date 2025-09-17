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
        $statusFilter = $request->get('status', 'all');
        
        // Get vendors with different status filters
        $query = User::where('role', 'vendor');
        
        switch ($statusFilter) {
            case 'verified':
                $query->where('status', 'verified');
                break;
            case 'unverified':
                $query->where('status', 'unverified');
                break;
            case 'blocked':
                $query->where('status', 'blocked');
                break;
            case 'rejected':
                $query->where('status', 'rejected');
                break;
            default:
                // 'all' - no additional filter
                break;
        }
        
        $vendors = $query->orderBy('created_at', 'desc')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? 'N/A',
                'regDate' => $user->created_at->format('Y-m-d'),
                'status' => ucfirst($user->status),
                'role' => ucfirst($user->role),
                'created_at' => $user->created_at->diffForHumans(),
            ];
        });
        
        return response()->json([
            'vendors' => $vendors,
            'total' => $vendors->count(),
            'statusFilter' => $statusFilter
        ]);
    }
    
    /**
     * Verify a vendor user
     */
    public function verify(Request $request, User $user)
    {
        if ($user->role !== 'vendor') {
            return response()->json(['error' => 'User is not a vendor'], 400);
        }
        
        $user->update(['status' => 'verified']);
        
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
    
    /**
     * Block a vendor user
     */
    public function block(Request $request, User $user)
    {
        if ($user->role !== 'vendor') {
            return response()->json(['error' => 'User is not a vendor'], 400);
        }
        
        $user->update(['status' => 'blocked']);
        
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
    
    /**
     * Unblock a vendor user
     */
    public function unblock(Request $request, User $user)
    {
        if ($user->role !== 'vendor') {
            return response()->json(['error' => 'User is not a vendor'], 400);
        }
        
        $user->update(['status' => 'verified']);
        
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
    
    /**
     * Reject a vendor user
     */
    public function reject(Request $request, User $user)
    {
        if ($user->role !== 'vendor') {
            return response()->json(['error' => 'User is not a vendor'], 400);
        }
        
        $user->update(['status' => 'rejected']);
        
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
}