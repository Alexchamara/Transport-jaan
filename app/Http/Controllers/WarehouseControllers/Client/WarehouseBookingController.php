<?php

namespace App\Http\Controllers\WarehouseControllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\Warehouse\WarehouseUnit;
use App\Models\Warehouse\WarehouseBooking;
use App\Models\Warehouse\WarehouseReview;
use App\Models\Warehouse\WarehouseLike;

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
        $warehouses = WarehouseUnit::query()
            ->where('type', $type)
            ->active()
            ->approved()
            ->with(['amenities', 'images'])
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
        $warehouse = WarehouseUnit::query()
            ->where('id', $id)
            ->where('type', $type)
            ->active()
            ->approved()
            ->with(['amenities', 'images'])
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
    // public function store(Request $request)
    // {
    //     $validated = $request->validate([
    //         'warehouse_id' => 'required|exists:warehouse_units,id',
    //         'company_name' => 'nullable|string|max:255',
    //         'contact_person' => 'required|string|max:255',
    //         'email' => 'required|email|max:255',
    //         'phone' => 'required|string|max:20',
    //         'company_address' => 'nullable|string',
    //         'storage_type' => 'required|string',
    //         'required_space' => 'required|numeric|min:1',
    //         'goods_type' => 'nullable|string',
    //         'goods_description' => 'required|string',
    //         'estimated_weight' => 'nullable|numeric',
    //         'special_requirements' => 'nullable|string',
    //         'amenities' => 'nullable|array',
    //         'start_date' => 'required|date',
    //         'end_date' => 'nullable|date|after:start_date',
    //         'duration_months' => 'nullable|integer|min:1',
    //         'access_hours' => 'nullable|string',
    //         'special_instructions' => 'nullable|string',
    //         'monthly_rate' => 'required|numeric|min:0',
    //         'security_deposit' => 'nullable|numeric|min:0',
    //         'setup_fee' => 'nullable|numeric|min:0',
    //         'total_amount' => 'required|numeric|min:0',
    //         'tax_amount' => 'nullable|numeric|min:0',
    //         'final_amount' => 'required|numeric|min:0',
    //         'payment_method' => 'required|string',
    //         'payment_option' => 'nullable|string',
    //         'payment_reference' => 'nullable|string',
    //         'terms_accepted' => 'required|accepted',
    //         'insurance_required' => 'nullable|boolean',
    //         'notes' => 'nullable|string',
    //     ]);

    //     try {
    //         // Generate a unique booking reference
    //         $bookingReference = 'WH-' . time() . '-' . Auth::id();
            
    //         // Calculate duration in months if not provided
    //         $durationMonths = $validated['duration_months'] ?? 1;
    //         if (!$validated['duration_months'] && $validated['end_date']) {
    //             $startDate = \Carbon\Carbon::parse($validated['start_date']);
    //             $endDate = \Carbon\Carbon::parse($validated['end_date']);
    //             $durationMonths = $startDate->diffInMonths($endDate) ?: 1;
    //         }

    //         // Set default end date if not provided
    //         $endDate = $validated['end_date'] ?? \Carbon\Carbon::parse($validated['start_date'])->addMonths($durationMonths)->toDateString();
            
    //         $booking = WarehouseBooking::create([
    //             'user_id' => Auth::id(),
    //             'warehouse_unit_id' => $validated['warehouse_id'],
    //             'booking_reference' => $bookingReference,
    //             'status' => 'pending',
                
    //             // Company Information
    //             'company_name' => $validated['company_name'] ?? 'N/A',
    //             'contact_person' => $validated['contact_person'],
    //             'phone' => $validated['phone'],
    //             'email' => $validated['email'],
    //             'company_address' => $validated['company_address'] ?? 'N/A',
                
    //             // Storage Requirements
    //             'storage_type' => $validated['storage_type'],
    //             'required_space' => $validated['required_space'],
    //             'goods_type' => $validated['goods_type'] ?? 'General',
    //             'goods_description' => $validated['goods_description'],
    //             'estimated_weight' => $validated['estimated_weight'] ?? null,
    //             'special_requirements' => $validated['special_requirements'] ? json_encode(['notes' => $validated['special_requirements']]) : null,
    //             'amenities' => $validated['amenities'] ? json_encode($validated['amenities']) : null,
                
    //             // Duration & Scheduling
    //             'start_date' => $validated['start_date'],
    //             'end_date' => $endDate,
    //             'duration_months' => $durationMonths,
    //             'access_hours' => $validated['access_hours'] ?? '24/7',
    //             'special_instructions' => $validated['special_instructions'] ?? null,
                
    //             // Pricing
    //             'monthly_rate' => $validated['monthly_rate'],
    //             'security_deposit' => $validated['security_deposit'] ?? 0,
    //             'setup_fee' => $validated['setup_fee'] ?? 0,
    //             'total_amount' => $validated['total_amount'],
    //             'tax_amount' => $validated['tax_amount'] ?? 0,
    //             'final_amount' => $validated['final_amount'],
                
    //             // Payment Information
    //             'payment_method' => $validated['payment_method'],
    //             'payment_status' => 'pending',
    //             'transaction_reference' => $validated['payment_reference'] ?? null,
                
    //             // Additional Fields
    //             'terms_accepted' => true,
    //             'insurance_required' => $validated['insurance_required'] ?? false,
    //             'notes' => $validated['notes'] ?? null,
    //         ]);

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Booking created successfully!',
    //             'booking_id' => $booking->id,
    //             'booking_reference' => $booking->booking_reference,
    //             'redirect' => route('warehouse-bookings.summary', $booking->id)
    //         ]);

    //     } catch (\Exception $e) {
    //         Log::error('Warehouse booking creation failed: ' . $e->getMessage(), [
    //             'user_id' => Auth::id(),
    //             'warehouse_id' => $validated['warehouse_id'] ?? null,
    //             'error' => $e->getTraceAsString()
    //         ]);

    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to create booking. Please try again.',
    //             'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
    //         ], 500);
    //     }
    // }

    public function store(Request $request)
    {
        // Debug: Log incoming request
        Log::info('Warehouse booking request received:', $request->all());

        // Check authentication
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Please log in to make a booking.',
                'redirect' => route('login')
            ], 401);
        }

        try {
            // Map frontend data format to backend expected format
            $requestData = $request->all();
            
            // Handle different data formats from frontend
            if (isset($requestData['move_in_date'])) {
                $requestData['start_date'] = $requestData['move_in_date'];
            }
            if (isset($requestData['move_out_date'])) {
                $requestData['end_date'] = $requestData['move_out_date'];
            }
            if (isset($requestData['storage_duration']) && !isset($requestData['duration_months'])) {
                // Extract months from storage_duration (e.g., "6 months")
                if (preg_match('/(\d+)/', $requestData['storage_duration'], $matches)) {
                    $requestData['duration_months'] = (int)$matches[1];
                }
            }
            if (isset($requestData['access_frequency'])) {
                $requestData['access_hours'] = $requestData['access_frequency'];
            }
            if (isset($requestData['special_handling'])) {
                $requestData['special_requirements'] = $requestData['special_handling'];
            }
            if (isset($requestData['climate_controlled'])) {
                $requestData['climate_control'] = $requestData['climate_controlled'];
            }
            
            // Set default values for required fields
            $requestData['monthly_rate'] = $requestData['monthly_rate'] ?? 850.00;
            $requestData['total_amount'] = $requestData['total_amount'] ?? 5550.00;
            $requestData['final_amount'] = $requestData['final_amount'] ?? 5550.00;
            $requestData['required_space'] = $requestData['required_space'] ?? 1000;
            
            // Enhanced validation with better error messages
            $validated = Validator::make($requestData, [
                'warehouse_id' => 'required|exists:warehouse_units,id',
                'company_name' => 'nullable|string|max:255',
                'contact_person' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
                'company_address' => 'nullable|string|max:500',
                'storage_type' => 'required|string|max:100',
                'required_space' => 'required|numeric|min:0.01',
                'goods_type' => 'nullable|string|max:100',
                'goods_description' => 'required|string|max:1000',
                'estimated_weight' => 'nullable|numeric|min:0',
                'special_requirements' => 'nullable|string|max:1000',
                'amenities' => 'nullable|array',
                'amenities.*' => 'string',
                'start_date' => 'required|date',
                'end_date' => 'nullable|date|after:start_date',
                'duration_months' => 'nullable|integer|min:1|max:120',
                'access_hours' => 'nullable|string|max:50',
                'special_instructions' => 'nullable|string|max:1000',
                'monthly_rate' => 'required|numeric|min:0',
                'security_deposit' => 'nullable|numeric|min:0',
                'setup_fee' => 'nullable|numeric|min:0',
                'total_amount' => 'required|numeric|min:0',
                'tax_amount' => 'nullable|numeric|min:0',
                'final_amount' => 'required|numeric|min:0',
                'payment_method' => 'required|string',
                'payment_option' => 'nullable|string|max:100',
                'payment_reference' => 'nullable|string|max:100',
                'terms_accepted' => 'required|accepted',
                'insurance_required' => 'nullable|boolean',
                'notes' => 'nullable|string|max:1000',
            ], [
                'warehouse_id.required' => 'Please select a warehouse.',
                'warehouse_id.exists' => 'Selected warehouse is not available.',
                'contact_person.required' => 'Contact person name is required.',
                'email.required' => 'Email address is required.',
                'phone.required' => 'Phone number is required.',
                'storage_type.required' => 'Storage type is required.',
                'required_space.required' => 'Required space is required.',
                'goods_description.required' => 'Goods description is required.',
                'start_date.required' => 'Start date is required.',
                'terms_accepted.accepted' => 'You must accept the terms and conditions.',
            ])->validate();

            Log::info('Validation passed for warehouse booking', ['user_id' => Auth::id()]);

            // Start database transaction
            DB::beginTransaction();

            // Verify warehouse is still available
            $warehouse = WarehouseUnit::query()
                ->where('id', $validated['warehouse_id'])
                ->active()
                ->approved()
                ->available()
                ->lockForUpdate()
                ->first();

            if (!$warehouse) {
                throw new \Exception('Selected warehouse is no longer available.');
            }

            // Generate a unique booking reference
            $bookingReference = 'WH-' . strtoupper(substr(md5(time() . Auth::id()), 0, 8));
            
            // Calculate duration in months if not provided
            $durationMonths = $validated['duration_months'] ?? 1;
            if (!$validated['duration_months'] && isset($validated['end_date'])) {
                $startDate = \Carbon\Carbon::parse($validated['start_date']);
                $endDate = \Carbon\Carbon::parse($validated['end_date']);
                $durationMonths = max(1, $startDate->diffInMonths($endDate));
            }

            // Set default end date if not provided
            $endDate = $validated['end_date'] ?? \Carbon\Carbon::parse($validated['start_date'])->addMonths($durationMonths)->toDateString();
            
            // Create the booking
            $booking = WarehouseBooking::create([
                'user_id' => Auth::id(),
                'warehouse_unit_id' => $validated['warehouse_id'],
                'booking_reference' => $bookingReference,
                'status' => 'pending',
                
                // Company Information
                'company_name' => $validated['company_name'] ?? null,
                'contact_person' => $validated['contact_person'],
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'company_address' => $validated['company_address'] ?? null,
                
                // Storage Requirements
                'storage_type' => $validated['storage_type'],
                'required_space' => $validated['required_space'],
                'goods_type' => $validated['goods_type'] ?? 'General',
                'goods_description' => $validated['goods_description'],
                'estimated_weight' => $validated['estimated_weight'] ?? null,
                'special_requirements' => !empty($validated['special_requirements']) ? 
                    json_encode(['notes' => $validated['special_requirements']]) : null,
                'amenities' => !empty($validated['amenities']) ? 
                    json_encode($validated['amenities']) : null,
                
                // Duration & Scheduling
                'start_date' => $validated['start_date'],
                'end_date' => $endDate,
                'duration_months' => $durationMonths,
                'access_hours' => $validated['access_hours'] ?? '24/7',
                'special_instructions' => $validated['special_instructions'] ?? null,
                
                // Pricing
                'monthly_rate' => $validated['monthly_rate'],
                'security_deposit' => $validated['security_deposit'] ?? 0,
                'setup_fee' => $validated['setup_fee'] ?? 0,
                'total_amount' => $validated['total_amount'],
                'tax_amount' => $validated['tax_amount'] ?? 0,
                'final_amount' => $validated['final_amount'],
                
                // Payment Information
                'payment_method' => $validated['payment_method'],
                'payment_option' => $validated['payment_option'] ?? null,
                'payment_reference' => $validated['payment_reference'] ?? null,
                'payment_status' => 'pending',
                'transaction_reference' => null,
                
                // Additional Fields
                'terms_accepted' => true,
                'insurance_required' => $validated['insurance_required'] ?? false,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Commit the transaction
            DB::commit();

            Log::info('Warehouse booking created successfully', [
                'booking_id' => $booking->id,
                'booking_reference' => $booking->booking_reference,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking created successfully!',
                'booking_id' => $booking->id,
                'booking_reference' => $booking->booking_reference,
                'redirect' => route('warehouse-bookings.summary', $booking->id)
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::warning('Warehouse booking validation failed', [
                'user_id' => Auth::id(),
                'errors' => $e->errors(),
                'input' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Please check the form for errors.',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Warehouse booking creation failed: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'warehouse_id' => $request->input('warehouse_id'),
                'error' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create booking. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
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

            return Inertia::render('Web/home/warehouse/WarehouseSummary', [
                'booking' => $booking
            ]);
        }

        return Inertia::render('Web/home/warehouse/WarehouseSummary');
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

    /**
     * Get warehouse unit details for API endpoint
     * 
     * @param int $id Warehouse unit ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function getWarehouseUnit($id)
    {
        try {
            $warehouse = WarehouseUnit::query()
                ->where('id', $id)
                ->active()
                ->approved()
                ->with(['amenities', 'images', 'currentApproval'])
                ->first();

            if (!$warehouse) {
                return response()->json([
                    'success' => false,
                    'message' => 'Warehouse not found or not available.'
                ], 404);
            }

            $warehouseData = [
                'id' => $warehouse->id,
                'name' => $warehouse->name,
                'description' => $warehouse->description,
                'address' => $warehouse->address,
                'type' => $warehouse->type,
                'total_area' => $warehouse->total_area,
                'capacity' => $warehouse->capacity,
                'base_price' => $warehouse->base_price,
                'monthly_rate' => $warehouse->monthly_rate,
                'amenities' => $warehouse->amenities?->map(function ($amenity) {
                    return [
                        'name' => $amenity->name,
                        'description' => $amenity->description,
                        'is_available' => (bool) ($amenity->is_available ?? true),
                    ];
                })->values()->all() ?? [],
                'images' => $warehouse->images?->map(function ($image) {
                    return $image->only(['id', 'path', 'type', 'is_active']);
                })->values()->all() ?? [],
                'access_hours' => $warehouse->operating_hours ?? $warehouse->access_hours ?? '24/7',
                'contact_info' => [
                    'person' => $warehouse->contact_person,
                    'phone' => $warehouse->contact_phone,
                    'email' => $warehouse->contact_email,
                ],
                'is_active' => $warehouse->is_active,
                'current_status' => $warehouse->currentApproval?->status ?? 'pending',
            ];

            return response()->json([
                'success' => true,
                'data' => $warehouseData
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching warehouse unit: ' . $e->getMessage(), [
                'warehouse_id' => $id,
                'error' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch warehouse details.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Toggle warehouse like/unlike
     */
    public function toggleLike(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Please login to add to wishlist'
            ], 401);
        }

        $request->validate([
            'warehouse_id' => 'required|exists:warehouse_units,id'
        ]);

        $userId = Auth::id();
        $warehouseId = $request->warehouse_id;

        try {
            $existingLike = WarehouseLike::where('user_id', $userId)
                ->where('warehouse_unit_id', $warehouseId)
                ->first();

            if ($existingLike) {
                // Unlike
                $existingLike->delete();
                $isLiked = false;
                $message = 'Removed from wishlist';
            } else {
                // Like
                WarehouseLike::create([
                    'user_id' => $userId,
                    'warehouse_unit_id' => $warehouseId
                ]);
                $isLiked = true;
                $message = 'Added to wishlist';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'is_liked' => $isLiked
            ]);

        } catch (\Exception $e) {
            Log::error('Error toggling warehouse like: ' . $e->getMessage(), [
                'user_id' => $userId,
                'warehouse_id' => $warehouseId,
                'error' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update wishlist'
            ], 500);
        }
    }

    /**
     * Store a warehouse review
     */
    public function storeReview(Request $request)
    {
        try {
            $validated = $request->validate([
                'warehouse_unit_id' => 'required|exists:warehouse_units,id',
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|max:1000',
                'pros' => 'nullable|string|max:500',
                'cons' => 'nullable|string|max:500',
                'stay_duration' => 'nullable|string|max:100',
            ]);

            // Check if user has already reviewed this warehouse
            $existingReview = WarehouseReview::where('warehouse_unit_id', $validated['warehouse_unit_id'])
                ->where('user_id', Auth::id())
                ->first();

            if ($existingReview) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already reviewed this warehouse.'
                ], 422);
            }

            // Create the review
            WarehouseReview::create([
                'warehouse_unit_id' => $validated['warehouse_unit_id'],
                'user_id' => Auth::id(),
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
                'pros' => $validated['pros'],
                'cons' => $validated['cons'],
                'stay_duration' => $validated['stay_duration'],
            ]);

            Log::info('Warehouse review created successfully', [
                'warehouse_unit_id' => $validated['warehouse_unit_id'],
                'user_id' => Auth::id(),
                'rating' => $validated['rating']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Review submitted successfully!'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the form for errors.',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Warehouse review creation failed: ' . $e->getMessage(), [
                'warehouse_unit_id' => $request->input('warehouse_unit_id'),
                'user_id' => Auth::id(),
                'error' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit review. Please try again.'
            ], 500);
        }
    }
}