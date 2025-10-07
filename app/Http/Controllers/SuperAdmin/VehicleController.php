<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class VehicleController extends Controller
{
    /**
     * Display a listing of vehicles with filtering options
     */
    public function index(Request $request)
    {
        // Debug: Log the received filters
        \Log::info('Vehicle filters received:', $request->all());

        // Ensure filters are always available (fixes the undefined filters issue)
        $filters = $request->only(['category_type', 'approval_status', 'status', 'search', 'sort_by', 'sort_order']);

        $query = Vehicle::with(['category', 'provider', 'media' => function($query) {
            $query->where('media_type', 'image')->where('is_primary', true);
        }]);

        // Filter by category type (land, sea, air)
        if ($request->filled('category_type') && $request->category_type !== 'all') {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('type', $request->category_type);
            });
        }

        // Filter by approval status
        if ($request->filled('approval_status') && $request->approval_status !== 'all') {
            $query->where('approval_status', $request->approval_status);
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by vehicle details
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

        // Sort options
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $validSortFields = ['created_at', 'model', 'manufacturer', 'approval_status', 'status', 'rental_price_per_day'];
        if (in_array($sortBy, $validSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $vehicles = $query->paginate(15)->withQueryString();

        // Get categories for filter dropdown
        $categories = VehicleCategory::select('type')->distinct()->get();

        // Get statistics
        $stats = $this->getVehicleStatistics();

        return Inertia::render('Web/home/SuperAdmin/Vehicles', [
            'vehicles' => $vehicles,
            'categories' => $categories,
            'filters' => $filters, // Use the explicitly defined filters array
            'stats' => $stats
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
            'reviews.user'
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
        // This can be implemented later for CSV/Excel export
        // For now, just return JSON
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
}
