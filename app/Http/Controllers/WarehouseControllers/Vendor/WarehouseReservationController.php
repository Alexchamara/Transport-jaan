<?php

namespace App\Http\Controllers\WarehouseControllers\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Warehouse\WarehouseBooking;
use App\Models\Warehouse\WarehouseUnit;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class WarehouseReservationController extends Controller
{
    /**
     * Get all warehouse reservations for the authenticated vendor
     */
    public function index(Request $request)
    {
        try {
            // DUMMY DATA FOR TESTING
            $reservations = [
                [
                    'id' => 1,
                    'booking_reference' => 'WH-RES-001',
                    'user_name' => 'John Doe',
                    'user_email' => 'john.doe@example.com',
                    'warehouse_name' => 'Cold Storage Unit A',
                    'warehouse_type' => 'Cold Storage',
                    'company_name' => 'ABC Trading Co.',
                    'contact_person' => 'John Doe',
                    'email' => 'john.doe@example.com',
                    'phone' => '+1 (555) 123-4567',
                    'goods_type' => 'Perishable Foods',
                    'goods_description' => 'Frozen vegetables and dairy products',
                    'estimated_weight' => '5000 kg',
                    'total_area' => 500.00,
                    'capacity' => 1000,
                    'capacity_unit' => 'sq_ft',
                    'required_space' => '500 sq ft',
                    'start_date' => '2025-01-15',
                    'end_date' => '2025-07-15',
                    'duration_months' => 6,
                    'monthly_rate' => 2500.00,
                    'security_deposit' => 5000.00,
                    'setup_fee' => 500.00,
                    'total_amount' => 20500.00,
                    'tax_amount' => 2050.00,
                    'final_amount' => 22550.00,
                    'payment_status' => 'paid',
                    'payment_method' => 'bank_transfer',
                    'status' => 'confirmed',
                    'access_hours' => '24/7',
                    'special_instructions' => 'Maintain temperature at -18°C',
                    'insurance_required' => true,
                    'terms_accepted' => true,
                    'created_at' => '2024-12-01 10:30:00',
                    'confirmed_at' => '2024-12-02 14:20:00',
                ],
                [
                    'id' => 2,
                    'booking_reference' => 'WH-RES-002',
                    'user_name' => 'Sarah Smith',
                    'user_email' => 'sarah.smith@example.com',
                    'warehouse_name' => 'Dry Storage Unit B',
                    'warehouse_type' => 'Dry Storage',
                    'company_name' => 'XYZ Electronics Ltd.',
                    'contact_person' => 'Sarah Smith',
                    'email' => 'sarah.smith@example.com',
                    'phone' => '+1 (555) 987-6543',
                    'goods_type' => 'Electronics',
                    'goods_description' => 'Consumer electronics and accessories',
                    'estimated_weight' => '3000 kg',
                    'total_area' => 300.00,
                    'capacity' => 600,
                    'capacity_unit' => 'sq_ft',
                    'required_space' => '300 sq ft',
                    'start_date' => '2025-02-01',
                    'end_date' => '2025-05-01',
                    'duration_months' => 3,
                    'monthly_rate' => 1800.00,
                    'security_deposit' => 3600.00,
                    'setup_fee' => 300.00,
                    'total_amount' => 9300.00,
                    'tax_amount' => 930.00,
                    'final_amount' => 10230.00,
                    'payment_status' => 'pending',
                    'payment_method' => null,
                    'status' => 'pending',
                    'access_hours' => 'Business hours (9 AM - 6 PM)',
                    'special_instructions' => 'Climate controlled storage required',
                    'insurance_required' => true,
                    'terms_accepted' => true,
                    'created_at' => '2024-12-05 16:45:00',
                    'confirmed_at' => null,
                ],
                [
                    'id' => 3,
                    'booking_reference' => 'WH-RES-003',
                    'user_name' => 'Michael Johnson',
                    'user_email' => 'michael.j@example.com',
                    'warehouse_name' => 'General Storage Unit C',
                    'warehouse_type' => 'General Purpose',
                    'company_name' => 'Johnson Furniture',
                    'contact_person' => 'Michael Johnson',
                    'email' => 'michael.j@example.com',
                    'phone' => '+1 (555) 456-7890',
                    'goods_type' => 'Furniture',
                    'goods_description' => 'Office furniture and fixtures',
                    'estimated_weight' => '8000 kg',
                    'total_area' => 800.00,
                    'capacity' => 1500,
                    'capacity_unit' => 'sq_ft',
                    'required_space' => '800 sq ft',
                    'start_date' => '2024-11-01',
                    'end_date' => '2025-11-01',
                    'duration_months' => 12,
                    'monthly_rate' => 2000.00,
                    'security_deposit' => 4000.00,
                    'setup_fee' => 400.00,
                    'total_amount' => 28400.00,
                    'tax_amount' => 2840.00,
                    'final_amount' => 31240.00,
                    'payment_status' => 'paid',
                    'payment_method' => 'credit_card',
                    'status' => 'active',
                    'access_hours' => 'Monday to Saturday (8 AM - 8 PM)',
                    'special_instructions' => 'Loading dock access required',
                    'insurance_required' => false,
                    'terms_accepted' => true,
                    'created_at' => '2024-10-25 09:15:00',
                    'confirmed_at' => '2024-10-26 11:30:00',
                ],
                [
                    'id' => 4,
                    'booking_reference' => 'WH-RES-004',
                    'user_name' => 'Emily Brown',
                    'user_email' => 'emily.brown@example.com',
                    'warehouse_name' => 'Hazmat Storage Unit D',
                    'warehouse_type' => 'Hazmat Storage',
                    'company_name' => 'ChemTech Industries',
                    'contact_person' => 'Emily Brown',
                    'email' => 'emily.brown@example.com',
                    'phone' => '+1 (555) 321-9876',
                    'goods_type' => 'Chemicals',
                    'goods_description' => 'Industrial chemicals and solvents',
                    'estimated_weight' => '2000 kg',
                    'total_area' => 200.00,
                    'capacity' => 400,
                    'capacity_unit' => 'sq_ft',
                    'required_space' => '200 sq ft',
                    'start_date' => '2025-01-01',
                    'end_date' => '2025-04-01',
                    'duration_months' => 3,
                    'monthly_rate' => 3500.00,
                    'security_deposit' => 7000.00,
                    'setup_fee' => 1000.00,
                    'total_amount' => 18500.00,
                    'tax_amount' => 1850.00,
                    'final_amount' => 20350.00,
                    'payment_status' => 'paid',
                    'payment_method' => 'bank_transfer',
                    'status' => 'confirmed',
                    'access_hours' => 'Restricted access (with supervision)',
                    'special_instructions' => 'Hazmat certified staff only. Fire suppression system required.',
                    'insurance_required' => true,
                    'terms_accepted' => true,
                    'created_at' => '2024-12-08 13:20:00',
                    'confirmed_at' => '2024-12-08 15:45:00',
                ],
                [
                    'id' => 5,
                    'booking_reference' => 'WH-RES-005',
                    'user_name' => 'David Wilson',
                    'user_email' => 'david.w@example.com',
                    'warehouse_name' => 'Climate Controlled Unit E',
                    'warehouse_type' => 'Climate Controlled',
                    'company_name' => 'WineVault Ltd.',
                    'contact_person' => 'David Wilson',
                    'email' => 'david.w@example.com',
                    'phone' => '+1 (555) 654-3210',
                    'goods_type' => 'Wine & Spirits',
                    'goods_description' => 'Premium wine collection',
                    'estimated_weight' => '1500 kg',
                    'total_area' => 150.00,
                    'capacity' => 300,
                    'capacity_unit' => 'sq_ft',
                    'required_space' => '150 sq ft',
                    'start_date' => '2025-01-10',
                    'end_date' => '2026-01-10',
                    'duration_months' => 12,
                    'monthly_rate' => 2200.00,
                    'security_deposit' => 4400.00,
                    'setup_fee' => 500.00,
                    'total_amount' => 31300.00,
                    'tax_amount' => 3130.00,
                    'final_amount' => 34430.00,
                    'payment_status' => 'pending',
                    'payment_method' => null,
                    'status' => 'pending',
                    'access_hours' => 'By appointment only',
                    'special_instructions' => 'Temperature: 12-15°C, Humidity: 60-70%',
                    'insurance_required' => true,
                    'terms_accepted' => true,
                    'created_at' => '2024-12-09 08:00:00',
                    'confirmed_at' => null,
                ],
            ];
            
            return response()->json([
                'success' => true,
                'data' => $reservations,
                'total' => count($reservations),
                'message' => 'Dummy test data returned successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching warehouse reservations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching warehouse reservations',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Apply filters to the reservation query
     */
    private function applyFilters($query, Request $request)
    {
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('booking_reference', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('goods_type', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->where('start_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('end_date', '<=', $request->date_to);
        }
    }

    /**
     * Transform reservation data for frontend
     */
    private function transformReservation($reservation)
    {
        $unit = $reservation->warehouseUnit;
        
        return [
            'id' => $reservation->booking_reference,
            'reservationDate' => $reservation->created_at->format('F j, Y'),
            'clientName' => $reservation->company_name ?? 'N/A',
            'contactPerson' => $reservation->contact_person,
            'email' => $reservation->email,
            'phone' => $reservation->phone,
            'warehouseName' => $unit->name ?? 'N/A',
            'warehouseUnit' => 'WH-' . str_pad($reservation->warehouse_unit_id, 3, '0', STR_PAD_LEFT),
            'unitType' => $unit->type ?? 'Standard',
            'unitSize' => $unit->total_area 
                ? number_format($unit->total_area, 2) . ' ' . ($unit->capacity_unit ?? 'sq_ft')
                : 'N/A',
            'purpose' => $reservation->goods_type ?? 'General Storage',
            'specialRequirements' => $this->formatSpecialRequirements($reservation),
            'durationUnit' => 'months',
            'durationValue' => $reservation->duration_months ?? 0,
            'quantity' => $reservation->required_space ?? 'N/A',
            'startDate' => Carbon::parse($reservation->start_date)->format('M j, Y'),
            'endDate' => Carbon::parse($reservation->end_date)->format('M j, Y'),
            'totalPrice' => 'LKR ' . number_format($reservation->final_amount ?? 0, 2),
            'paymentStatus' => ucfirst($reservation->payment_status ?? 'pending'),
            'status' => $reservation->status ?? 'pending',
            'notes' => $reservation->notes ?? $reservation->special_instructions ?? '',
            'goodsDescription' => $reservation->goods_description,
            'estimatedWeight' => $reservation->estimated_weight,
            'accessHours' => $reservation->access_hours,
            'monthlyRate' => $reservation->monthly_rate,
            'securityDeposit' => $reservation->security_deposit,
            'setupFee' => $reservation->setup_fee,
            'taxAmount' => $reservation->tax_amount,
            'paymentMethod' => $reservation->payment_method,
            'insuranceRequired' => $reservation->insurance_required ?? false,
            'termsAccepted' => $reservation->terms_accepted ?? false,
        ];
    }

    /**
     * Get reservation statistics for the vendor dashboard
     */
    public function getStats(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Define time periods
            $now = Carbon::now();
            $currentWeekStart = $now->copy()->startOfWeek();
            $currentWeekEnd = $now->copy()->endOfWeek();
            $lastWeekStart = $now->copy()->subWeek()->startOfWeek();
            $lastWeekEnd = $now->copy()->subWeek()->endOfWeek();
            
            // Base query for vendor's reservations
            $baseQuery = function() use ($user) {
                return WarehouseBooking::query();
            };
            
            // Calculate current week stats using optimized queries
            $stats = [
                'active_reservations' => $baseQuery()
                    ->whereIn('status', ['confirmed', 'active'])
                    ->where('start_date', '<=', $now)
                    ->where('end_date', '>=', $now)
                    ->count(),
                    
                'pending_reservations' => $baseQuery()
                    ->where('status', 'pending')
                    ->count(),
                    
                'expired_reservations' => $baseQuery()
                    ->where('status', 'completed')
                    ->whereBetween('updated_at', [$currentWeekStart, $currentWeekEnd])
                    ->count(),
                    
                'cancelled_reservations' => $baseQuery()
                    ->where('status', 'cancelled')
                    ->whereBetween('updated_at', [$currentWeekStart, $currentWeekEnd])
                    ->count(),
            ];
            
            // Calculate previous week stats for growth comparison
            $previousStats = [
                'previous_active_reservations' => $baseQuery()
                    ->whereIn('status', ['confirmed', 'active'])
                    ->where('start_date', '<=', $lastWeekEnd)
                    ->where('end_date', '>=', $lastWeekStart)
                    ->count(),
                    
                'previous_pending_reservations' => $baseQuery()
                    ->where('status', 'pending')
                    ->where('created_at', '<=', $lastWeekEnd)
                    ->count(),
                    
                'previous_expired_reservations' => $baseQuery()
                    ->where('status', 'completed')
                    ->whereBetween('updated_at', [$lastWeekStart, $lastWeekEnd])
                    ->count(),
                    
                'previous_cancelled_reservations' => $baseQuery()
                    ->where('status', 'cancelled')
                    ->whereBetween('updated_at', [$lastWeekStart, $lastWeekEnd])
                    ->count(),
            ];
            
            return response()->json([
                'success' => true,
                'data' => array_merge($stats, $previousStats)
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching reservation stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching reservation statistics',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get reservation chart data for the authenticated vendor
     */
    public function getChartData(Request $request)
    {
        try {
            $user = Auth::user();
            $period = $request->get('period', 'Last 8 months');
            
            // Determine the date range
            $startDate = $this->getStartDateForPeriod($period);
            $endDate = Carbon::now();
            
            // Fetch aggregated reservation data using a single optimized query
            $reservations = WarehouseBooking::query()
                ->select([
                    DB::raw('YEAR(created_at) as year'),
                    DB::raw('MONTH(created_at) as month'),
                    DB::raw('COUNT(CASE WHEN status IN ("confirmed", "completed", "active") THEN 1 END) as confirmed'),
                    DB::raw('COUNT(CASE WHEN status = "cancelled" THEN 1 END) as cancelled')
                ])
                ->whereBetween('created_at', [$startDate, $endDate])
                ->groupBy('year', 'month')
                ->orderBy('year', 'asc')
                ->orderBy('month', 'asc')
                ->get()
                ->keyBy(function($item) {
                    return $item->year . '-' . $item->month;
                });
            
            // Generate complete month range with data
            $chartData = [];
            $current = $startDate->copy();
            
            while ($current <= $endDate) {
                $key = $current->year . '-' . $current->month;
                $monthData = $reservations->get($key);
                
                $chartData[] = [
                    'name' => $current->format('M'),
                    'month' => $current->month,
                    'year' => $current->year,
                    'done' => $monthData ? (int)$monthData->confirmed : 0,
                    'cancelled' => $monthData ? (int)$monthData->cancelled : 0,
                ];
                
                $current->addMonth();
            }
            
            return response()->json([
                'success' => true,
                'data' => $chartData
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching reservation chart data: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching reservation chart data',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Confirm a pending reservation
     */
    public function confirm(Request $request, $reservationId)
    {
        try {
            $user = Auth::user();
            
            // Find reservation with authorization check
            $reservation = $this->findReservationForVendor($user, $reservationId);
            
            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reservation not found or access denied'
                ], 404);
            }
            
            // Validate reservation status
            if ($reservation->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending reservations can be confirmed. Current status: ' . $reservation->status
                ], 400);
            }
            
            DB::beginTransaction();
            
            try {
                // Update reservation status
                $reservation->update([
                    'status' => 'confirmed',
                    'confirmed_at' => now()
                ]);
                
                // Create notification for the customer
                $this->createNotification(
                    $reservation->user_id,
                    'warehouse_reservation_confirmed',
                    [
                        'title' => 'Warehouse Reservation Confirmed',
                        'message' => "Your warehouse reservation (Ref: {$reservation->booking_reference}) has been confirmed.",
                        'unit_name' => $reservation->warehouseUnit->name ?? 'N/A',
                        'reservation_id' => $reservation->booking_reference,
                    ],
                    $reservation->id
                );
                
                DB::commit();
                
                Log::info('Reservation confirmed', [
                    'reservation_id' => $reservationId,
                    'vendor_id' => $user->id,
                    'confirmed_at' => now()
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Reservation confirmed successfully',
                    'reservation' => [
                        'id' => $reservation->booking_reference,
                        'status' => $reservation->status
                    ]
                ]);
                
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
            
        } catch (\Exception $e) {
            Log::error('Error confirming reservation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error confirming reservation',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Cancel a reservation
     */
    public function cancel(Request $request, $reservationId)
    {
        $request->validate([
            'cancellation_reason' => 'required|string|min:10|max:500'
        ]);
        
        try {
            $user = Auth::user();
            
            // Find reservation with authorization check
            $reservation = $this->findReservationForVendor($user, $reservationId);
            
            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reservation not found or access denied'
                ], 404);
            }
            
            // Validate reservation status
            if (!in_array($reservation->status, ['pending', 'confirmed'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending or confirmed reservations can be cancelled. Current status: ' . $reservation->status
                ], 400);
            }
            
            DB::beginTransaction();
            
            try {
                $cancellationReason = $request->cancellation_reason;
                
                // Update reservation
                $reservation->update([
                    'status' => 'cancelled',
                    'notes' => ($reservation->notes ?? '') . "\n\nCancelled on " . now()->format('M j, Y g:i A') . "\nReason: " . $cancellationReason,
                    'cancelled_at' => now()
                ]);
                
                // Create notification
                $this->createNotification(
                    $reservation->user_id,
                    'warehouse_reservation_cancelled',
                    [
                        'title' => 'Warehouse Reservation Cancelled',
                        'message' => "Your warehouse reservation (Ref: {$reservation->booking_reference}) has been cancelled.",
                        'unit_name' => $reservation->warehouseUnit->name ?? 'N/A',
                        'reservation_id' => $reservation->booking_reference,
                        'cancellation_reason' => $cancellationReason,
                    ],
                    $reservation->id
                );
                
                DB::commit();
                
                Log::info('Reservation cancelled', [
                    'reservation_id' => $reservationId,
                    'vendor_id' => $user->id,
                    'cancellation_reason' => $cancellationReason,
                    'cancelled_at' => now()
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Reservation cancelled successfully',
                    'reservation' => [
                        'id' => $reservation->booking_reference,
                        'status' => $reservation->status
                    ]
                ]);
                
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
            
        } catch (\Exception $e) {
            Log::error('Error cancelling reservation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error cancelling reservation',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Mark reservation as completed/expired
     */
    public function complete(Request $request, $reservationId)
    {
        try {
            $user = Auth::user();
            
            // Find reservation with authorization check
            $reservation = $this->findReservationForVendor($user, $reservationId);
            
            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reservation not found or access denied'
                ], 404);
            }
            
            // Validate reservation status
            if (!in_array($reservation->status, ['confirmed', 'active'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only confirmed or active reservations can be completed. Current status: ' . $reservation->status
                ], 400);
            }
            
            DB::beginTransaction();
            
            try {
                // Update reservation
                $reservation->update([
                    'status' => 'completed',
                    'payment_status' => 'paid',
                    'completed_at' => now()
                ]);
                
                DB::commit();
                
                Log::info('Reservation completed', [
                    'reservation_id' => $reservationId,
                    'vendor_id' => $user->id,
                    'completed_at' => now()
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Reservation marked as completed successfully',
                    'reservation' => [
                        'id' => $reservation->booking_reference,
                        'status' => $reservation->status,
                        'payment_status' => $reservation->payment_status
                    ]
                ]);
                
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
            
        } catch (\Exception $e) {
            Log::error('Error completing reservation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error completing reservation',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Update reservation details
     */
    public function update(Request $request, $reservationId)
    {
        $validated = $request->validate([
            'monthly_rate' => 'sometimes|numeric|min:0',
            'security_deposit' => 'sometimes|numeric|min:0',
            'setup_fee' => 'sometimes|numeric|min:0',
            'special_instructions' => 'sometimes|string|max:1000',
            'access_hours' => 'sometimes|string|max:100',
            'payment_status' => 'sometimes|in:pending,paid,failed'
        ]);
        
        try {
            $user = Auth::user();
            
            // Find reservation with authorization check
            $reservation = $this->findReservationForVendor($user, $reservationId);
            
            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reservation not found or access denied'
                ], 404);
            }
            
            // Validate reservation can be modified
            if (in_array($reservation->status, ['completed', 'cancelled'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot modify completed or cancelled reservations'
                ], 400);
            }
            
            DB::beginTransaction();
            
            try {
                $needsRecalculation = false;
                
                // Update fields
                foreach ($validated as $key => $value) {
                    if (in_array($key, ['monthly_rate', 'security_deposit', 'setup_fee'])) {
                        $needsRecalculation = true;
                    }
                    $reservation->{$key} = $value;
                }
                
                // Recalculate totals if pricing changed
                if ($needsRecalculation) {
                    $monthlyRate = $reservation->monthly_rate ?? 0;
                    $securityDeposit = $reservation->security_deposit ?? 0;
                    $setupFee = $reservation->setup_fee ?? 0;
                    $durationMonths = $reservation->duration_months ?? 1;
                    
                    $totalAmount = ($monthlyRate * $durationMonths) + $securityDeposit + $setupFee;
                    $taxRate = 0.10; // 10% tax
                    $taxAmount = $totalAmount * $taxRate;
                    $finalAmount = $totalAmount + $taxAmount;
                    
                    $reservation->total_amount = $totalAmount;
                    $reservation->tax_amount = $taxAmount;
                    $reservation->final_amount = $finalAmount;
                }
                
                $reservation->save();
                
                DB::commit();
                
                Log::info('Reservation updated', [
                    'reservation_id' => $reservationId,
                    'vendor_id' => $user->id,
                    'updated_fields' => array_keys($validated),
                    'updated_at' => now()
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Reservation updated successfully',
                    'reservation' => [
                        'id' => $reservation->booking_reference,
                        'monthly_rate' => $reservation->monthly_rate,
                        'security_deposit' => $reservation->security_deposit,
                        'setup_fee' => $reservation->setup_fee,
                        'total_amount' => $reservation->total_amount,
                        'tax_amount' => $reservation->tax_amount,
                        'final_amount' => $reservation->final_amount,
                        'payment_status' => $reservation->payment_status
                    ]
                ]);
                
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
            
        } catch (\Exception $e) {
            Log::error('Error updating reservation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating reservation',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get start date based on the selected period
     */
    private function getStartDateForPeriod($period)
    {
        switch ($period) {
            case 'Last 3 months':
                return Carbon::now()->subMonths(3)->startOfMonth();
            case 'Last 6 months':
                return Carbon::now()->subMonths(6)->startOfMonth();
            case 'Last 8 months':
                return Carbon::now()->subMonths(8)->startOfMonth();
            case 'Last 12 months':
                return Carbon::now()->subMonths(12)->startOfMonth();
            case 'This year':
                return Carbon::now()->startOfYear();
            case 'Last year':
                return Carbon::now()->subYear()->startOfYear();
            default:
                return Carbon::now()->subMonths(8)->startOfMonth();
        }
    }

    /**
     * Helper method to format special requirements
     */
    private function formatSpecialRequirements($reservation)
    {
        $requirements = [];
        
        if ($reservation->special_requirements && is_array($reservation->special_requirements)) {
            foreach ($reservation->special_requirements as $key => $value) {
                if ($value && $value !== '' && $value !== null) {
                    $requirements[] = ucfirst(str_replace('_', ' ', $key)) . ': ' . $value;
                }
            }
        }
        
        if ($reservation->storage_type) {
            $requirements[] = 'Storage type: ' . $reservation->storage_type;
        }
        
        return implode(', ', $requirements) ?: 'Standard requirements';
    }

    /**
     * Find reservation for authenticated vendor
     */
    private function findReservationForVendor($user, $reservationId)
    {
        return WarehouseBooking::query()
            ->with(['user:id,name,email', 'warehouseUnit:id,name,user_id,type,total_area,capacity,capacity_unit'])
            ->where('booking_reference', $reservationId)
            ->first();
    }

    /**
     * Create notification helper
     */
    private function createNotification($userId, $type, $data, $reservationId = null)
    {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'data' => $data,
            'booking_id' => $reservationId,
            'read_at' => null
        ]);
    }
}
