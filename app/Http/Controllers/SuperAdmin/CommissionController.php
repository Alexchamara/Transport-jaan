<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommissionController extends Controller
{
    /**
     * Show the commission settings page
     */
    public function edit()
    {
        $commissions = Commission::all();
        
        return Inertia::render('Web/home/SuperAdmin/CommissionSettings', [
            'commissions' => $commissions,
            'serviceTypes' => Commission::getServiceTypes(),
        ]);
    }

    /**
     * Get all commissions for API
     */
    public function index()
    {
        return response()->json([
            'data' => Commission::all(),
            'serviceTypes' => Commission::getServiceTypes(),
        ]);
    }

    /**
     * Store a new commission
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_type' => 'required|string|in:vehicle,warehouse,courier,freight,ticket',
            'commission_percentage' => 'required|numeric|min:0|max:100',
            'fixed_amount' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // Check if commission already exists for this service
        $existing = Commission::where('service_type', $validated['service_type'])->first();
        if ($existing) {
            return response()->json([
                'message' => 'Commission for this service type already exists. Please update instead.',
            ], 422);
        }

        $commission = Commission::create($validated);

        return response()->json([
            'message' => 'Commission created successfully',
            'data' => $commission,
        ], 201);
    }

    /**
     * Get a specific commission
     */
    public function show(Commission $commission)
    {
        return response()->json($commission);
    }

    /**
     * Update a commission
     */
    public function update(Request $request, Commission $commission)
    {
        $validated = $request->validate([
            'service_type' => 'sometimes|string|in:vehicle,warehouse,courier,freight,ticket',
            'commission_percentage' => 'sometimes|numeric|min:0|max:100',
            'fixed_amount' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $commission->update($validated);

        return response()->json([
            'message' => 'Commission updated successfully',
            'data' => $commission,
        ]);
    }

    /**
     * Delete a commission
     */
    public function destroy(Commission $commission)
    {
        $commission->delete();

        return response()->json([
            'message' => 'Commission deleted successfully',
        ]);
    }

    /**
     * Bulk operations
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'numeric',
        ]);

        Commission::whereIn('id', $validated['ids'])->delete();

        return response()->json([
            'message' => 'Commissions deleted successfully',
        ]);
    }

    /**
     * Update status (active/inactive)
     */
    public function updateStatus(Request $request, Commission $commission)
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $commission->update($validated);

        return response()->json([
            'message' => 'Commission status updated successfully',
            'data' => $commission,
        ]);
    }
}

