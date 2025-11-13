<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Warehouse\WarehouseUnit;
use App\Models\Warehouse\WarehouseApproval;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    /**
     * Display warehouse management page with actual data
     */
    public function index(Request $request)
    {
        try {
            // Get query parameters
            $search = $request->get('search');
            $typeFilter = $request->get('type_filter');
            $statusFilter = $request->get('status_filter');

            // Build query for warehouse units with their approvals and owner info
            $query = WarehouseUnit::with([
                'owner:id,name,email',
                'currentApproval',
                'activeImages' => function($q) {
                    $q->take(1); // Get only first image for listing
                }
            ]);

            // Apply search filter
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

            // Apply type filter
            if ($typeFilter && $typeFilter !== 'all') {
                $query->where('type', $typeFilter);
            }

            // Apply status filter based on approval status
            if ($statusFilter && $statusFilter !== 'all') {
                $query->where(function ($q) use ($statusFilter) {
                    // Check warehouses with approval records
                    $q->whereHas('currentApproval', function ($subQ) use ($statusFilter) {
                        $subQ->where('status', $statusFilter);
                    });

                    // If filtering for pending, also include warehouses without approval records
                    if ($statusFilter === 'pending') {
                        $q->orWhereDoesntHave('approvals');
                    }
                });
            }

            // Get paginated results
            $warehouses = $query->latest()
                ->paginate(10)
                ->withQueryString();

            // Transform data for frontend
            $warehouses->getCollection()->transform(function ($warehouse) {
                return [
                    'id' => $warehouse->id,
                    'name' => $warehouse->name,
                    'location' => $warehouse->address ?? 'N/A',
                    'capacity' => number_format($warehouse->capacity ?? 0, 0),
                    'total_area' => number_format($warehouse->total_area ?? 0, 0),
                    'type' => $warehouse->formatted_type ?? $warehouse->type,
                    'status' => $warehouse->current_status,
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

            return Inertia::render('Web/home/SuperAdmin/Warehouse', [
                'warehouses' => $warehouses,
                'filters' => [
                    'search' => $search,
                    'type_filter' => $typeFilter,
                    'status_filter' => $statusFilter
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching warehouses: ' . $e->getMessage());

            return Inertia::render('Web/home/SuperAdmin/Warehouse', [
                'warehouses' => [],
                'filters' => [],
                'error' => 'Failed to load warehouse data'
            ]);
        }
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
                    'formatted_type' => $warehouse->formatted_type,
                    'status' => $warehouse->current_status,
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
