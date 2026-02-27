<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Response;

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
        $perPage = $request->get('per_page', 10);

        \Log::info('SuperAdmin UserController index called', [
            'search' => $search,
            'roleFilter' => $roleFilter,
            'statusFilter' => $statusFilter,
            'per_page' => $perPage,
            'request_method' => $request->method(),
            'is_ajax' => $request->ajax(),
            'wants_json' => $request->wantsJson()
        ]);

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

        $paginatedUsers = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        $users = $paginatedUsers->getCollection()->map(function ($user) {
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

        // Get counts for different categories (from all users, not just current page)
        $allUsersQuery = User::whereNotIn('role', ['admin', 'SuperAdmin']);
        $totalUsers = $allUsersQuery->count();
        $clientCount = User::where('role', 'client')->whereNotIn('role', ['admin', 'SuperAdmin'])->count();
        $vendorCount = User::where('role', 'vendor')->whereNotIn('role', ['admin', 'SuperAdmin'])->count();
        $verifiedCount = User::where('status', 'verified')->whereNotIn('role', ['admin', 'SuperAdmin'])->count();
        $unverifiedCount = User::where('status', 'unverified')->whereNotIn('role', ['admin', 'SuperAdmin'])->count();
        $blockedCount = User::whereIn('status', ['blocked', 'rejected'])->whereNotIn('role', ['admin', 'SuperAdmin'])->count();

        \Log::info('SuperAdmin UserController data prepared', [
            'total_users' => $totalUsers,
            'client_count' => $clientCount,
            'vendor_count' => $vendorCount,
            'verified_count' => $verifiedCount,
            'current_page' => $paginatedUsers->currentPage(),
            'per_page' => $paginatedUsers->perPage()
        ]);

        // Return Inertia response for web interface
        return Inertia::render('Web/home/SuperAdmin/Users', [
            'users' => $users->values(),
            'pagination' => [
                'current_page' => $paginatedUsers->currentPage(),
                'last_page' => $paginatedUsers->lastPage(),
                'per_page' => $paginatedUsers->perPage(),
                'total' => $paginatedUsers->total(),
                'from' => $paginatedUsers->firstItem(),
                'to' => $paginatedUsers->lastItem(),
            ],
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
                'per_page' => $perPage,
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

    /**
     * Display clients only
     */
    public function clients(Request $request)
    {
        $search = $request->get('search', '');
        $statusFilter = $request->get('status', 'all');
        $perPage = $request->get('per_page', 10);

        // Get all clients
        $query = User::where('role', 'client');

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        $paginatedUsers = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        $users = $paginatedUsers->getCollection()->map(function ($user) {
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

        $totalUsers = User::where('role', 'client')->count();
        $verifiedCount = User::where('role', 'client')->where('status', 'verified')->count();
        $unverifiedCount = User::where('role', 'client')->where('status', 'unverified')->count();

        return Inertia::render('Web/home/SuperAdmin/Clients', [
            'users' => $users->values(),
            'pagination' => [
                'current_page' => $paginatedUsers->currentPage(),
                'last_page' => $paginatedUsers->lastPage(),
                'per_page' => $paginatedUsers->perPage(),
                'total' => $paginatedUsers->total(),
                'from' => $paginatedUsers->firstItem(),
                'to' => $paginatedUsers->lastItem(),
            ],
            'counts' => [
                'total' => $totalUsers,
                'clients' => $totalUsers,
                'vendors' => 0,
                'verified' => $verifiedCount,
                'unverified' => $unverifiedCount,
                'blocked' => 0,
            ],
            'filters' => [
                'search' => $search,
                'role' => 'client',
                'status' => $statusFilter,
                'per_page' => $perPage,
            ]
        ]);
    }

    /**
     * Display service providers (vendors) only
     */
    public function serviceProviders(Request $request)
    {
        $search = $request->get('search', '');
        $statusFilter = $request->get('status', 'all');
        $perPage = $request->get('per_page', 10);

        // Get all vendors/service providers
        $query = User::where('role', 'vendor');

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        $paginatedUsers = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        $users = $paginatedUsers->getCollection()->map(function ($user) {
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

        $totalUsers = User::where('role', 'vendor')->count();
        $verifiedCount = User::where('role', 'vendor')->where('status', 'verified')->count();
        $unverifiedCount = User::where('role', 'vendor')->where('status', 'unverified')->count();

        return Inertia::render('Web/home/SuperAdmin/ServiceProviders', [
            'users' => $users->values(),
            'pagination' => [
                'current_page' => $paginatedUsers->currentPage(),
                'last_page' => $paginatedUsers->lastPage(),
                'per_page' => $paginatedUsers->perPage(),
                'total' => $paginatedUsers->total(),
                'from' => $paginatedUsers->firstItem(),
                'to' => $paginatedUsers->lastItem(),
            ],
            'counts' => [
                'total' => $totalUsers,
                'clients' => 0,
                'vendors' => $totalUsers,
                'verified' => $verifiedCount,
                'unverified' => $unverifiedCount,
                'blocked' => 0,
            ],
            'filters' => [
                'search' => $search,
                'role' => 'vendor',
                'status' => $statusFilter,
                'per_page' => $perPage,
            ]
        ]);
    }

    /**
     * Export users based on filters and format
     */
    public function export(Request $request)
    {
        $search = $request->get('search', '');
        $roleFilter = $request->get('role', 'all');
        $statusFilter = $request->get('status', 'all');
        $format = $request->get('format', 'csv');

        // Build query based on current route
        $currentRoute = $request->segment(3); // Gets 'clients', 'service-providers', or null
        
        if ($currentRoute === 'clients') {
            $query = User::where('role', 'client');
        } elseif ($currentRoute === 'service-providers') {
            $query = User::where('role', 'vendor');
        } else {
            $query = User::whereNotIn('role', ['admin', 'SuperAdmin']);
        }

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Apply role filter (only for general users page)
        if ($roleFilter !== 'all' && !$currentRoute) {
            $query->where('role', $roleFilter);
        }

        // Apply status filter
        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        // Export based on format
        switch ($format) {
            case 'pdf':
                return $this->exportPDF($users);
            case 'excel':
                return $this->exportExcel($users);
            case 'csv':
            default:
                return $this->exportCSV($users);
        }
    }

    private function exportCSV($users)
    {
        $filename = 'users_' . date('Y-m-d_His') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($users) {
            $file = fopen('php://output', 'w');
            
            // Add CSV headers
            fputcsv($file, ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Country', 'Registration Date']);

            // Add data rows
            foreach ($users as $user) {
                fputcsv($file, [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->phone ?? 'N/A',
                    $user->role,
                    $user->status,
                    $user->country ?? 'N/A',
                    $user->created_at->format('Y-m-d'),
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    private function exportExcel($users)
    {
        $filename = 'users_' . date('Y-m-d_His') . '.xlsx';
        
        // Create a simple CSV export (you can enhance this with actual Excel formatting)
        $headers = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        // For now, use CSV format (you can integrate Laravel Excel package for better Excel support)
        return $this->exportCSV($users);
    }

    private function exportPDF($users)
    {
        $filename = 'users_' . date('Y-m-d_His') . '.pdf';
        
        try {
            // Try using Dompdf if available
            if (class_exists('Barryvdh\DomPDF\Facade\Pdf')) {
                $html = $this->generateUserTableHTML($users);
                $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
                $pdf->setPaper('A4', 'landscape');
                return $pdf->download($filename);
            }
            
            // Alternative: try direct Dompdf instantiation
            $dompdf = new \Dompdf\Dompdf([
                'isPhpEnabled' => false,
                'enable_remote' => false,
            ]);
            
            $html = $this->generateUserTableHTML($users);
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'landscape');
            $dompdf->render();
            
            return Response::make($dompdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => "attachment; filename=\"$filename\"",
            ]);
        } catch (\Exception $e) {
            \Log::error('PDF export failed: ' . $e->getMessage());
            // Fall back to CSV
            return $this->exportCSV($users);
        }
    }

    private function generateUserTableHTML($users)
    {
        $html = '<html><head><meta charset="UTF-8"><style>
            body { font-family: Arial, sans-serif; margin: 15px; font-size: 11px; }
            h1 { color: #333; font-size: 18px; margin-bottom: 5px; }
            p { margin: 5px 0; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #999; padding: 6px; text-align: left; }
            th { background-color: #0E43FB; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f5f5f5; }
        </style></head><body>';
        
        $html .= '<h1>Users Export Report</h1>';
        $html .= '<p><strong>Generated on:</strong> ' . date('Y-m-d H:i:s') . '</p>';
        $html .= '<p><strong>Total Records:</strong> ' . count($users) . '</p>';
        $html .= '<table>';
        $html .= '<thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Registration Date</th></tr></thead>';
        $html .= '<tbody>';
        
        foreach ($users as $user) {
            $html .= '<tr>';
            $html .= '<td>' . htmlspecialchars((string)$user->id) . '</td>';
            $html .= '<td>' . htmlspecialchars($user->name ?? '') . '</td>';
            $html .= '<td>' . htmlspecialchars($user->email ?? '') . '</td>';
            $html .= '<td>' . htmlspecialchars($user->phone ?? 'N/A') . '</td>';
            $html .= '<td>' . htmlspecialchars($user->role ?? '') . '</td>';
            $html .= '<td>' . htmlspecialchars($user->status ?? '') . '</td>';
            $html .= '<td>' . ($user->created_at ? $user->created_at->format('Y-m-d') : 'N/A') . '</td>';
            $html .= '</tr>';
        }
        
        $html .= '</tbody></table></body></html>';
        
        return $html;
    }
}


