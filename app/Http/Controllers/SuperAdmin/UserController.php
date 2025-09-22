<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display all users except admin and superadmin
     */
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $roleFilter = $request->get('role', 'all');
        $statusFilter = $request->get('status', 'all');

        // Get all users except admin and superadmin
        $query = User::whereNotIn('role', ['admin', 'SuperAdmin']);

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Apply role filter
        if ($roleFilter !== 'all') {
            $query->where('role', $roleFilter);
        }

        // Apply status filter
        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        $users = $query->orderBy('created_at', 'desc')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? 'N/A',
                'address' => $user->address ?? 'N/A',
                'country' => $user->country ?? 'N/A',
                'date_of_birth' => $user->date_of_birth ?? 'N/A',
                'role' => $user->role,
                'status' => $user->status,
                'regDate' => $user->created_at->format('Y-m-d'),
                'created_at' => $user->created_at->diffForHumans(),
            ];
        });

        // Get counts for different categories
        $totalUsers = $users->count();
        $clientCount = $users->where('role', 'client')->count();
        $vendorCount = $users->where('role', 'vendor')->count();
        $verifiedCount = $users->where('status', 'verified')->count();
        $unverifiedCount = $users->where('status', 'unverified')->count();
        $blockedCount = $users->whereIn('status', ['blocked', 'rejected'])->count();

        // Check if this is an API request
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'users' => $users->values(),
                'total' => $totalUsers,
                'counts' => [
                    'total' => $totalUsers,
                    'clients' => $clientCount,
                    'vendors' => $vendorCount,
                    'verified' => $verifiedCount,
                    'unverified' => $unverifiedCount,
                    'blocked' => $blockedCount,
                ],
                'filters' => [
                    'search' => $search,
                    'role' => $roleFilter,
                    'status' => $statusFilter,
                ]
            ]);
        }

        // Return Inertia response for web interface
        return Inertia::render('Web/home/SuperAdmin/Users', [
            'users' => $users->values(),
            'counts' => [
                'total' => $totalUsers,
                'clients' => $clientCount,
                'vendors' => $vendorCount,
                'verified' => $verifiedCount,
                'unverified' => $unverifiedCount,
                'blocked' => $blockedCount,
            ],
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
                'status' => $statusFilter,
            ]
        ]);
    }

    /**
     * Show user details
     */
    public function show(User $user)
    {
        // Prevent viewing admin and superadmin users
        if (in_array($user->role, ['admin', 'SuperAdmin'])) {
            return redirect()->back()->with('error', 'Access denied');
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'country' => $user->country,
                'date_of_birth' => $user->date_of_birth,
                'role' => $user->role,
                'status' => $user->status,
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new user
     */
    public function create()
    {
        return Inertia::render('Web/home/SuperAdmin/CreateUser');
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', Rule::in(['client', 'vendor', 'freight'])],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'country' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'status' => $request->role === 'vendor' ? 'unverified' : 'verified',
            'phone' => $request->phone,
            'address' => $request->address,
            'country' => $request->country,
            'date_of_birth' => $request->date_of_birth,
        ]);

        return redirect()->route('superadmin.Users')->with('success', 'User created successfully!');
    }

    /**
     * Show the form for editing a user
     */
    public function edit(User $user)
    {
        // Prevent editing admin and superadmin users
        if (in_array($user->role, ['admin', 'SuperAdmin'])) {
            return redirect()->back()->with('error', 'Access denied');
        }

        return Inertia::render('Web/home/SuperAdmin/EditUser', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'country' => $user->country,
                'date_of_birth' => $user->date_of_birth,
                'role' => $user->role,
                'status' => $user->status,
            ]
        ]);
    }

    /**
     * Update user information
     */
    public function update(Request $request, User $user)
    {
        // Prevent editing admin and superadmin users
        if (in_array($user->role, ['admin', 'SuperAdmin'])) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Access denied'], 403);
            }
            return redirect()->back()->with('error', 'Access denied');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'country' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date',
            'role' => ['required', Rule::in(['client', 'vendor', 'freight'])],
            'status' => ['required', Rule::in(['verified', 'unverified', 'blocked', 'rejected'])],
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        // Remove password if not provided
        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        // For AJAX requests (like from modal), return JSON response
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'user' => $user->fresh()
            ]);
        }

        return redirect()->route('superadmin.Users')->with('success', 'User updated successfully');
    }

    /**
     * Delete user
     */
    public function destroy(Request $request, User $user)
    {
        // Prevent deleting admin and superadmin users
        if (in_array($user->role, ['admin', 'SuperAdmin'])) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Access denied'], 403);
            }
            return redirect()->back()->with('error', 'Access denied');
        }

        $userName = $user->name;
        $user->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "User '{$userName}' deleted successfully"
            ]);
        }

        return redirect()->back()->with('success', "User '{$userName}' deleted successfully");
    }

    /**
     * Bulk delete users
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id'
        ]);

        // Get users and filter out admin/superadmin
        $users = User::whereIn('id', $validated['user_ids'])
                    ->whereNotIn('role', ['admin', 'SuperAdmin'])
                    ->get();

        $deletedCount = $users->count();
        $users->each->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "{$deletedCount} users deleted successfully"
            ]);
        }

        return redirect()->back()->with('success', "{$deletedCount} users deleted successfully");
    }

    /**
     * Change user status
     */
    public function changeStatus(Request $request, User $user)
    {
        // Prevent changing status of admin and superadmin users
        if (in_array($user->role, ['admin', 'SuperAdmin'])) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Access denied'], 403);
            }
            return redirect()->back()->with('error', 'Access denied');
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(['verified', 'unverified', 'blocked', 'rejected'])]
        ]);

        $user->update(['status' => $validated['status']]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'User status updated successfully',
                'user' => $user->fresh()
            ]);
        }

        return redirect()->back()->with('success', 'User status updated successfully');
    }
}
