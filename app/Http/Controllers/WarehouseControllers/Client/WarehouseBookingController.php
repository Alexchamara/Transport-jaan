<?php

namespace App\Http\Controllers\WarehouseControllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Warehouse\WarehouseUnit;
use App\Models\Warehouse\WarehouseBooking;

class WarehouseBookingController extends Controller
{
    /**
     * Display the warehouse category selection page
     */
    public function category()
    {
        return Inertia::render('Web/components/warehouseBooking/bookingCategoryPage');
    }

    /**
     * Display warehouses by type
     */
    public function index($type)
    {
        // Get warehouses by type
        $warehouses = WarehouseUnit::where('type', $type)
            ->where('approval_status', 'approved')
            ->where('is_active', true)
            ->get();

        $warehouseDetails = $warehouses->map(function ($warehouse) {
            return [
                'warehouse_id' => $warehouse->id,
                'area' => $warehouse->total_area,
                'capacity' => $warehouse->capacity,
                'amenities' => $warehouse->amenities ?? [],
                'type' => $warehouse->type,
                'price_per_day' => $warehouse->price,
                'name' => $warehouse->name,
                'description' => $warehouse->description,
                'address' => $warehouse->address
            ];
        });

        $warehouseImages = $warehouses->map(function ($warehouse) {
            return [
                'warehouse_id' => $warehouse->id,
                'images' => $warehouse->images ?? []
            ];
        });

        return Inertia::render('Web/components/warehouseBooking/warehouseIndex', [
            'warehouses' => $warehouses,
            'warehouseDetails' => $warehouseDetails,
            'warehouseImages' => $warehouseImages,
            'type' => $type
        ]);
    }

    /**
     * Show booking details form for specific warehouse
     */
    public function details($type, $id)
    {
        $warehouse = WarehouseUnit::where('id', $id)
            ->where('type', $type)
            ->where('approval_status', 'approved')
            ->where('is_active', true)
            ->firstOrFail();

        $warehouseDetails = [
            'warehouse_id' => $warehouse->id,
            'area' => $warehouse->total_area,
            'capacity' => $warehouse->capacity,
            'amenities' => $warehouse->amenities ?? [],
            'type' => $warehouse->type,
            'price_per_day' => $warehouse->price,
            'address' => $warehouse->address,
            'name' => $warehouse->name,
            'description' => $warehouse->description
        ];

        $warehouseImages = $warehouse->images ?? [];

        return Inertia::render('Web/components/warehouseBooking/bookingPage', [
            'warehouse' => $warehouse,
            'warehouseDetails' => $warehouseDetails,
            'warehouseImages' => $warehouseImages
        ]);
    }

    /**
     * Display checkout page
     */
    public function checkout()
    {
        return Inertia::render('Web/home/warehouse/WarehouseCheckout');
    }

    /**
     * Display payment page
     */
    public function payments()
    {
        return Inertia::render('Web/home/warehouse/WarehousePayments');
    }

    /**
     * Store warehouse booking
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'warehouse_id' => 'required|exists:warehouse_units,id',
            'company_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'storage_type' => 'required|string',
            'required_space' => 'required|numeric|min:1',
            'storage_duration' => 'required|string',
            'move_in_date' => 'required|date|after_or_equal:today',
            'move_in_time' => 'required|string',
            'move_out_date' => 'nullable|date|after:move_in_date',
            'move_out_time' => 'nullable|string',
            'goods_description' => 'required|string',
            'special_handling' => 'nullable|string',
            'access_frequency' => 'required|string',
            'climate_controlled' => 'boolean',
            'insurance_required' => 'boolean',
            'special_requirements' => 'nullable|string',
            'terms_accepted' => 'required|accepted',
        ]);

        try {
            $booking = WarehouseBooking::create([
                'user_id' => Auth::id(),
                'warehouse_unit_id' => $validated['warehouse_id'],
                'company_name' => $validated['company_name'],
                'contact_person' => $validated['contact_person'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'storage_type' => $validated['storage_type'],
                'required_space' => $validated['required_space'],
                'storage_duration' => $validated['storage_duration'],
                'move_in_date' => $validated['move_in_date'],
                'move_in_time' => $validated['move_in_time'],
                'move_out_date' => $validated['move_out_date'],
                'move_out_time' => $validated['move_out_time'],
                'goods_description' => $validated['goods_description'],
                'special_handling' => $validated['special_handling'],
                'access_frequency' => $validated['access_frequency'],
                'climate_controlled' => $validated['climate_controlled'] ?? false,
                'insurance_required' => $validated['insurance_required'] ?? true,
                'special_requirements' => $validated['special_requirements'],
                'status' => 'pending',
                'booking_date' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking created successfully!',
                'booking_id' => $booking->id,
                'redirect' => route('warehouse-bookings.summary', $booking->id)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create booking. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display booking summary/confirmation
     */
    public function summary($bookingId = null)
    {
        if ($bookingId) {
            $booking = WarehouseBooking::with(['warehouseUnit', 'user'])
                ->where('id', $bookingId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            return Inertia::render('Web/components/warehouseBooking/bookingSummary', [
                'booking' => $booking
            ]);
        }

        return Inertia::render('Web/components/warehouseBooking/bookingSummary');
    }

    /**
     * Display user's booking list
     */
    public function list()
    {
        $bookings = WarehouseBooking::with(['warehouseUnit'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Web/components/warehouseBooking/bookingList', [
            'bookings' => $bookings
        ]);
    }

    /**
     * Show specific booking details
     */
    public function show($id)
    {
        $booking = WarehouseBooking::with(['warehouseUnit', 'user'])
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return Inertia::render('Web/components/warehouseBooking/bookingDetails', [
            'booking' => $booking
        ]);
    }

    /**
     * Cancel a booking
     */
    public function cancel($id)
    {
        $booking = WarehouseBooking::where('id', $id)
            ->where('user_id', Auth::id())
            ->where('status', '!=', 'cancelled')
            ->firstOrFail();

        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully!'
        ]);
    }
}