<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Warehouse\WarehouseBooking;
use App\Models\Warehouse\WarehouseUnit;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class VendorWarehouseBookingController extends Controller
{
    /**
     * Get all warehouse bookings for the authenticated vendor
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Get warehouse units owned by the vendor
            $warehouseUnitIds = WarehouseUnit::where('user_id', $user->id)->pluck('id');
            
            // Get bookings for vendor's warehouses with related data
            $query = WarehouseBooking::with(['user', 'warehouseUnit'])
                ->whereIn('warehouse_unit_id', $warehouseUnitIds);
            
            // Apply filters if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            if ($request->has('payment_status')) {
                $query->where('payment_status', $request->payment_status);
            }
            
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('booking_reference', 'like', '%' . $search . '%')
                      ->orWhere('company_name', 'like', '%' . $search . '%')
                      ->orWhere('contact_person', 'like', '%' . $search . '%')
                      ->orWhere('goods_type', 'like', '%' . $search . '%');
                });
            }
            
            $bookings = $query->orderBy('created_at', 'desc')->paginate(10);
            
            // Transform the data for the frontend
            $transformedBookings = $bookings->getCollection()->map(function ($booking) {
                return [
                    'id' => $booking->booking_reference,
                    'bookingDate' => $booking->created_at->format('F j, Y'),
                    'clientName' => $booking->company_name,
                    'contactPerson' => $booking->contact_person,
                    'email' => $booking->email,
                    'phone' => $booking->phone,
                    'warehouseName' => $booking->warehouseUnit->name ?? 'N/A',
                    'warehouseUnit' => 'WH-' . str_pad($booking->warehouse_unit_id, 3, '0', STR_PAD_LEFT),
                    'purpose' => $booking->goods_type,
                    'specialRequirements' => $this->formatSpecialRequirements($booking),
                    'durationUnit' => 'months',
                    'durationValue' => $booking->duration_months,
                    'quantity' => $booking->required_space,
                    'startDate' => \Carbon\Carbon::parse($booking->start_date)->format('M j, Y'),
                    'endDate' => \Carbon\Carbon::parse($booking->end_date)->format('M j, Y'),
                    'totalPrice' => '$' . number_format($booking->final_amount, 0),
                    'paymentStatus' => ucfirst($booking->payment_status),
                    'status' => $booking->status,
                    'notes' => $booking->notes ?? $booking->special_instructions ?? '',
                    'goodsDescription' => $booking->goods_description,
                    'estimatedWeight' => $booking->estimated_weight,
                    'accessHours' => $booking->access_hours,
                    'monthlyRate' => $booking->monthly_rate,
                    'securityDeposit' => $booking->security_deposit,
                    'setupFee' => $booking->setup_fee,
                    'taxAmount' => $booking->tax_amount,
                    'paymentMethod' => $booking->payment_method,
                    'insuranceRequired' => $booking->insurance_required,
                    'termsAccepted' => $booking->terms_accepted,
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $transformedBookings,
                'pagination' => [
                    'current_page' => $bookings->currentPage(),
                    'last_page' => $bookings->lastPage(),
                    'per_page' => $bookings->perPage(),
                    'total' => $bookings->total()
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching warehouse bookings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching warehouse bookings'
            ], 500);
        }
    }
    
    /**
     * Get booking statistics for the vendor dashboard
     */
    public function getStats(Request $request)
    {
        try {
            $user = Auth::user();
            $warehouseUnitIds = WarehouseUnit::where('user_id', $user->id)->pluck('id');
            
            // Current week calculations
            $currentWeekStart = Carbon::now()->startOfWeek();
            $currentWeekEnd = Carbon::now()->endOfWeek();
            
            // Last week calculations
            $lastWeekStart = Carbon::now()->subWeek()->startOfWeek();
            $lastWeekEnd = Carbon::now()->subWeek()->endOfWeek();
            
            // Current stats
            $stats = [
                'upcoming_bookings' => WarehouseBooking::whereIn('warehouse_unit_id', $warehouseUnitIds)
                    ->whereIn('status', ['confirmed', 'active'])
                    ->where('start_date', '>', now())
                    ->count(),
                    
                'pending_bookings' => WarehouseBooking::whereIn('warehouse_unit_id', $warehouseUnitIds)
                    ->where('status', 'pending')
                    ->count(),
                    
                'cancelled_bookings' => WarehouseBooking::whereIn('warehouse_unit_id', $warehouseUnitIds)
                    ->where('status', 'cancelled')
                    ->whereBetween('created_at', [$currentWeekStart, $currentWeekEnd])
                    ->count(),
                    
                'completed_bookings' => WarehouseBooking::whereIn('warehouse_unit_id', $warehouseUnitIds)
                    ->where('status', 'completed')
                    ->whereBetween('created_at', [$currentWeekStart, $currentWeekEnd])
                    ->count(),
            ];
            
            // Previous week stats for comparison
            $previousStats = [
                'previous_upcoming_bookings' => WarehouseBooking::whereIn('warehouse_unit_id', $warehouseUnitIds)
                    ->whereIn('status', ['confirmed', 'active'])
                    ->where('start_date', '>', $lastWeekEnd)
                    ->where('created_at', '<=', $lastWeekEnd)
                    ->count(),
                    
                'previous_pending_bookings' => WarehouseBooking::whereIn('warehouse_unit_id', $warehouseUnitIds)
                    ->where('status', 'pending')
                    ->where('created_at', '<=', $lastWeekEnd)
                    ->count(),
                    
                'previous_cancelled_bookings' => WarehouseBooking::whereIn('warehouse_unit_id', $warehouseUnitIds)
                    ->where('status', 'cancelled')
                    ->whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])
                    ->count(),
                    
                'previous_completed_bookings' => WarehouseBooking::whereIn('warehouse_unit_id', $warehouseUnitIds)
                    ->where('status', 'completed')
                    ->whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])
                    ->count(),
            ];
            
            return response()->json([
                'success' => true,
                'data' => array_merge($stats, $previousStats)
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching booking stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching booking statistics'
            ], 500);
        }
    }
    
    /**
     * Approve a pending booking
     */
    public function approve(Request $request, $bookingId)
    {
        try {
            $user = Auth::user();
            $warehouseUnitIds = WarehouseUnit::where('user_id', $user->id)->pluck('id');
            
            $booking = WarehouseBooking::where('booking_reference', $bookingId)
                ->whereIn('warehouse_unit_id', $warehouseUnitIds)
                ->first();
                
            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found or access denied'
                ], 404);
            }
            
            if ($booking->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending bookings can be approved'
                ], 400);
            }
            
            DB::beginTransaction();
            
            $booking->status = 'confirmed';
            $booking->save();
            
            // Create notification for the user who made the booking
            Notification::create([
                'user_id' => $booking->user_id,
                'type' => 'warehouse_approval',
                'data' => [
                    'title' => 'Warehouse Booking Approved',
                    'message' => "Your warehouse booking (Ref: {$booking->booking_reference}) has been approved by the vendor.",
                    'unit_name' => $booking->warehouseUnit->name ?? 'N/A',
                    'booking_id' => $booking->booking_reference,
                ],
                'booking_id' => $booking->id,
            ]);
            
            // Log the action
            Log::info('Booking approved', [
                'booking_id' => $bookingId,
                'vendor_id' => $user->id,
                'approved_at' => now()
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Booking approved successfully',
                'booking' => [
                    'id' => $booking->booking_reference,
                    'status' => $booking->status
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error approving booking: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error approving booking'
            ], 500);
        }
    }
    
    /**
     * Reject a pending booking
     */
    public function reject(Request $request, $bookingId)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500'
        ]);
        
        try {
            $user = Auth::user();
            $warehouseUnitIds = WarehouseUnit::where('user_id', $user->id)->pluck('id');
            
            $booking = WarehouseBooking::where('booking_reference', $bookingId)
                ->whereIn('warehouse_unit_id', $warehouseUnitIds)
                ->first();
                
            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found or access denied'
                ], 404);
            }
            
            if ($booking->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending bookings can be rejected'
                ], 400);
            }
            
            DB::beginTransaction();
            
            $booking->status = 'cancelled';
            $booking->notes = ($booking->notes ?? '') . "\nRejection reason: " . $request->rejection_reason;
            $booking->save();
            
            // Create notification for the user who made the booking
            Notification::create([
                'user_id' => $booking->user_id,
                'type' => 'warehouse_rejection',
                'data' => [
                    'title' => 'Warehouse Booking Rejected',
                    'message' => "Your warehouse booking (Ref: {$booking->booking_reference}) has been rejected. Reason: {$request->rejection_reason}",
                    'unit_name' => $booking->warehouseUnit->name ?? 'N/A',
                    'booking_id' => $booking->booking_reference,
                    'rejection_reason' => $request->rejection_reason,
                ],
                'booking_id' => $booking->id,
            ]);
            
            // Log the action
            Log::info('Booking rejected', [
                'booking_id' => $bookingId,
                'vendor_id' => $user->id,
                'rejection_reason' => $request->rejection_reason,
                'rejected_at' => now()
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Booking rejected successfully',
                'booking' => [
                    'id' => $booking->booking_reference,
                    'status' => $booking->status
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error rejecting booking: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error rejecting booking'
            ], 500);
        }
    }
    
    /**
     * Mark booking as completed
     */
    public function complete(Request $request, $bookingId)
    {
        try {
            $user = Auth::user();
            $warehouseUnitIds = WarehouseUnit::where('user_id', $user->id)->pluck('id');
            
            $booking = WarehouseBooking::where('booking_reference', $bookingId)
                ->whereIn('warehouse_unit_id', $warehouseUnitIds)
                ->first();
                
            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found or access denied'
                ], 404);
            }
            
            if (!in_array($booking->status, ['confirmed', 'active'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only confirmed or active bookings can be completed'
                ], 400);
            }
            
            DB::beginTransaction();
            
            $booking->status = 'completed';
            $booking->payment_status = 'paid';
            $booking->save();
            
            // Log the action
            Log::info('Booking completed', [
                'booking_id' => $bookingId,
                'vendor_id' => $user->id,
                'completed_at' => now()
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Booking marked as completed successfully',
                'booking' => [
                    'id' => $booking->booking_reference,
                    'status' => $booking->status,
                    'payment_status' => $booking->payment_status
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error completing booking: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error completing booking'
            ], 500);
        }
    }
    
    /**
     * Update booking details
     */
    public function update(Request $request, $bookingId)
    {
        $request->validate([
            'monthly_rate' => 'sometimes|numeric|min:0',
            'security_deposit' => 'sometimes|numeric|min:0',
            'setup_fee' => 'sometimes|numeric|min:0',
            'special_instructions' => 'sometimes|string|max:1000',
            'access_hours' => 'sometimes|string|max:100',
            'payment_status' => 'sometimes|in:pending,paid,failed'
        ]);
        
        try {
            $user = Auth::user();
            $warehouseUnitIds = WarehouseUnit::where('user_id', $user->id)->pluck('id');
            
            $booking = WarehouseBooking::where('booking_reference', $bookingId)
                ->whereIn('warehouse_unit_id', $warehouseUnitIds)
                ->first();
                
            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found or access denied'
                ], 404);
            }
            
            if ($booking->status === 'completed' || $booking->status === 'cancelled') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot modify completed or cancelled bookings'
                ], 400);
            }
            
            DB::beginTransaction();
            
            // Update allowed fields
            if ($request->has('monthly_rate')) {
                $booking->monthly_rate = $request->monthly_rate;
            }
            if ($request->has('security_deposit')) {
                $booking->security_deposit = $request->security_deposit;
            }
            if ($request->has('setup_fee')) {
                $booking->setup_fee = $request->setup_fee;
            }
            if ($request->has('special_instructions')) {
                $booking->special_instructions = $request->special_instructions;
            }
            if ($request->has('access_hours')) {
                $booking->access_hours = $request->access_hours;
            }
            if ($request->has('payment_status')) {
                $booking->payment_status = $request->payment_status;
            }
            
            // Recalculate totals if pricing changed
            if ($request->hasAny(['monthly_rate', 'security_deposit', 'setup_fee'])) {
                $monthlyRate = $booking->monthly_rate ?? 0;
                $securityDeposit = $booking->security_deposit ?? 0;
                $setupFee = $booking->setup_fee ?? 0;
                $durationMonths = $booking->duration_months ?? 1;
                
                $totalAmount = ($monthlyRate * $durationMonths) + $securityDeposit + $setupFee;
                $taxRate = 0.10; // 10% tax (adjust as needed)
                $taxAmount = $totalAmount * $taxRate;
                $finalAmount = $totalAmount + $taxAmount;
                
                $booking->total_amount = $totalAmount;
                $booking->tax_amount = $taxAmount;
                $booking->final_amount = $finalAmount;
            }
            
            $booking->save();
            
            // Log the action
            Log::info('Booking updated', [
                'booking_id' => $bookingId,
                'vendor_id' => $user->id,
                'updated_fields' => $request->only([
                    'monthly_rate', 'security_deposit', 'setup_fee', 
                    'special_instructions', 'access_hours', 'payment_status'
                ]),
                'updated_at' => now()
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Booking updated successfully',
                'booking' => [
                    'id' => $booking->booking_reference,
                    'monthly_rate' => $booking->monthly_rate,
                    'security_deposit' => $booking->security_deposit,
                    'setup_fee' => $booking->setup_fee,
                    'total_amount' => $booking->total_amount,
                    'tax_amount' => $booking->tax_amount,
                    'final_amount' => $booking->final_amount,
                    'payment_status' => $booking->payment_status
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating booking: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating booking'
            ], 500);
        }
    }
    
    /**
     * Get detailed booking information
     */
    public function show(Request $request, $bookingId)
    {
        try {
            $user = Auth::user();
            $warehouseUnitIds = WarehouseUnit::where('user_id', $user->id)->pluck('id');
            
            $booking = WarehouseBooking::with(['user', 'warehouseUnit'])
                ->where('booking_reference', $bookingId)
                ->whereIn('warehouse_unit_id', $warehouseUnitIds)
                ->first();
                
            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found or access denied'
                ], 404);
            }
            
            $detailedBooking = [
                'id' => $booking->booking_reference,
                'bookingDate' => $booking->created_at->format('F j, Y'),
                'clientName' => $booking->company_name,
                'contactPerson' => $booking->contact_person,
                'email' => $booking->email,
                'phone' => $booking->phone,
                'companyAddress' => $booking->company_address,
                'warehouseName' => $booking->warehouseUnit->name ?? 'N/A',
                'warehouseUnit' => 'WH-' . str_pad($booking->warehouse_unit_id, 3, '0', STR_PAD_LEFT),
                'storageType' => $booking->storage_type,
                'requiredSpace' => $booking->required_space,
                'goodsType' => $booking->goods_type,
                'goodsDescription' => $booking->goods_description,
                'estimatedWeight' => $booking->estimated_weight,
                'specialRequirements' => $booking->special_requirements,
                'amenities' => $booking->amenities,
                'startDate' => \Carbon\Carbon::parse($booking->start_date)->format('M j, Y'),
                'endDate' => \Carbon\Carbon::parse($booking->end_date)->format('M j, Y'),
                'durationMonths' => $booking->duration_months,
                'accessHours' => $booking->access_hours,
                'specialInstructions' => $booking->special_instructions,
                'monthlyRate' => $booking->monthly_rate,
                'securityDeposit' => $booking->security_deposit,
                'setupFee' => $booking->setup_fee,
                'totalAmount' => $booking->total_amount,
                'taxAmount' => $booking->tax_amount,
                'finalAmount' => $booking->final_amount,
                'paymentMethod' => $booking->payment_method,
                'paymentStatus' => $booking->payment_status,
                'paymentDate' => $booking->payment_date ? \Carbon\Carbon::parse($booking->payment_date)->format('M j, Y') : null,
                'transactionReference' => $booking->transaction_reference,
                'termsAccepted' => $booking->terms_accepted,
                'insuranceRequired' => $booking->insurance_required,
                'notes' => $booking->notes,
                'documents' => $booking->documents,
                'status' => $booking->status,
                'createdAt' => $booking->created_at->format('M j, Y g:i A'),
                'updatedAt' => $booking->updated_at->format('M j, Y g:i A')
            ];
            
            return response()->json([
                'success' => true,
                'data' => $detailedBooking
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching booking details: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching booking details'
            ], 500);
        }
    }
    
    /**
     * Helper method to format special requirements
     */
    private function formatSpecialRequirements($booking)
    {
        $requirements = [];
        
        if ($booking->special_requirements && is_array($booking->special_requirements)) {
            foreach ($booking->special_requirements as $key => $value) {
                if ($value && $value !== '' && $value !== null) {
                    $requirements[] = ucfirst(str_replace('_', ' ', $key)) . ': ' . $value;
                }
            }
        }
        
        if ($booking->storage_type) {
            $requirements[] = 'Storage type: ' . $booking->storage_type;
        }
        
        return implode(', ', $requirements) ?: 'Standard requirements';
    }

    /**
     * Get booking chart data for the authenticated vendor
     */
    public function getChartData(Request $request)
    {
        try {
            $user = Auth::user();
            $period = $request->get('period', 'Last 8 months');
            
            // Get warehouse units owned by the vendor
            $warehouseUnitIds = WarehouseUnit::where('user_id', $user->id)->pluck('id');
            
            // Determine the date range based on the period
            $startDate = $this->getStartDateForPeriod($period);
            $endDate = Carbon::now();
            
            // Get booking data grouped by month
            $bookings = WarehouseBooking::selectRaw('
                YEAR(created_at) as year,
                MONTH(created_at) as month,
                COUNT(CASE WHEN status IN ("confirmed", "completed") THEN 1 END) as done,
                COUNT(CASE WHEN status = "cancelled" THEN 1 END) as cancelled
            ')
            ->whereIn('warehouse_unit_id', $warehouseUnitIds)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();
            
            // Format the data for the chart
            $chartData = [];
            $current = $startDate->copy();
            
            while ($current <= $endDate) {
                $year = $current->year;
                $month = $current->month;
                
                // Find booking data for this month
                $monthData = $bookings->first(function ($booking) use ($year, $month) {
                    return $booking->year == $year && $booking->month == $month;
                });
                
                $chartData[] = [
                    'name' => $current->format('M'),
                    'done' => $monthData ? (int)$monthData->done : 0,
                    'cancelled' => $monthData ? (int)$monthData->cancelled : 0,
                ];
                
                $current->addMonth();
            }
            
            return response()->json([
                'success' => true,
                'data' => $chartData
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching booking chart data: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching booking chart data'
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
     * Get payment transactions for the authenticated vendor
     */
    public function getPaymentTransactions(Request $request)
    {
        try {
            $user = Auth::user();
            $warehouseUnitIds = WarehouseUnit::where('user_id', $user->id)->pluck('id');
            
            $query = WarehouseBooking::with(['user', 'warehouseUnit'])
                ->whereIn('warehouse_unit_id', $warehouseUnitIds);
            
            // Apply search filter
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('booking_reference', 'like', "%{$search}%")
                      ->orWhere('company_name', 'like', "%{$search}%")
                      ->orWhere('contact_person', 'like', "%{$search}%")
                      ->orWhereHas('user', function($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%");
                      })
                      ->orWhereHas('warehouseUnit', function($unitQuery) use ($search) {
                          $unitQuery->where('name', 'like', "%{$search}%");
                      });
                });
            }
            
            // Apply status filter
            if ($request->has('status') && !empty($request->status)) {
                $status = strtolower($request->status);
                if ($status === 'completed') {
                    $query->where('status', 'completed');
                } elseif ($status === 'pending') {
                    $query->where('status', 'pending');
                } elseif ($status === 'confirmed') {
                    $query->where('status', 'confirmed');
                } elseif ($status === 'cancelled') {
                    $query->where('status', 'cancelled');
                }
            }
            
            // Apply date filter
            if ($request->has('date') && !empty($request->date)) {
                $date = Carbon::parse($request->date);
                $query->whereDate('created_at', $date);
            }
            
            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            
            $perPage = $request->get('per_page', 10);
            $bookings = $query->paginate($perPage);
            
            // Transform the data
            $transformedBookings = $bookings->getCollection()->map(function ($booking) {
                $startDate = Carbon::parse($booking->start_date);
                $endDate = Carbon::parse($booking->end_date);
                $days = $startDate->diffInDays($endDate);
                
                // Calculate daily rate
                $dailyRate = $booking->monthly_rate && $days > 0 
                    ? round($booking->monthly_rate / 30, 2) 
                    : 0;
                
                // Determine status color and background
                $statusInfo = $this->getStatusStyle($booking->status);
                
                return [
                    'id' => $booking->booking_reference,
                    'client' => $booking->user->name ?? $booking->contact_person ?? 'N/A',
                    'warehouse' => $booking->warehouseUnit->name ?? 'N/A',
                    'ratePerDay' => 'LKR ' . number_format($dailyRate, 2),
                    'days' => (string)$days,
                    'amount' => 'LKR ' . number_format($booking->final_amount ?? $booking->total_amount ?? 0, 2),
                    'dueDate' => $booking->end_date ? Carbon::parse($booking->end_date)->format('Y.m.d') : 'N/A',
                    'status' => ucfirst($booking->status),
                    'statusColor' => $statusInfo['color'],
                    'statusBg' => $statusInfo['bg'],
                    'payment_status' => $booking->payment_status,
                    'monthly_rate' => $booking->monthly_rate,
                    'security_deposit' => $booking->security_deposit,
                    'setup_fee' => $booking->setup_fee,
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $transformedBookings,
                'pagination' => [
                    'current_page' => $bookings->currentPage(),
                    'last_page' => $bookings->lastPage(),
                    'per_page' => $bookings->perPage(),
                    'total' => $bookings->total(),
                    'from' => $bookings->firstItem(),
                    'to' => $bookings->lastItem(),
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching payment transactions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching payment transactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get payment statistics for the vendor
     */
    public function getPaymentStats(Request $request)
    {
        try {
            $user = Auth::user();
            $warehouseUnitIds = WarehouseUnit::where('user_id', $user->id)->pluck('id');
            
            // Get current period stats
            $currentBalance = WarehouseBooking::whereIn('warehouse_unit_id', $warehouseUnitIds)
                ->where('payment_status', 'paid')
                ->sum('final_amount');
            
            $totalIncome = WarehouseBooking::whereIn('warehouse_unit_id', $warehouseUnitIds)
                ->whereIn('status', ['confirmed', 'completed', 'active'])
                ->sum('final_amount');
            
            $totalExpenses = WarehouseBooking::whereIn('warehouse_unit_id', $warehouseUnitIds)
                ->where('status', 'cancelled')
                ->where('payment_status', 'refunded')
                ->sum('security_deposit');
            
            // Calculate growth percentages (comparing to last week)
            $lastWeekBalance = WarehouseBooking::whereIn('warehouse_unit_id', $warehouseUnitIds)
                ->where('payment_status', 'paid')
                ->where('payment_date', '<=', Carbon::now()->subWeek())
                ->sum('final_amount');
            
            $lastWeekIncome = WarehouseBooking::whereIn('warehouse_unit_id', $warehouseUnitIds)
                ->whereIn('status', ['confirmed', 'completed', 'active'])
                ->where('created_at', '<=', Carbon::now()->subWeek())
                ->sum('final_amount');
            
            $balanceGrowth = $lastWeekBalance > 0 
                ? round((($currentBalance - $lastWeekBalance) / $lastWeekBalance) * 100, 2) 
                : 0;
            
            $incomeGrowth = $lastWeekIncome > 0 
                ? round((($totalIncome - $lastWeekIncome) / $lastWeekIncome) * 100, 2) 
                : 0;
            
            $expensesGrowth = 2.86; // Placeholder or calculate if you have expense tracking
            
            return response()->json([
                'success' => true,
                'data' => [
                    'balance' => [
                        'amount' => number_format($currentBalance, 0),
                        'growth' => $balanceGrowth,
                        'isPositive' => $balanceGrowth >= 0
                    ],
                    'income' => [
                        'amount' => number_format($totalIncome, 0),
                        'growth' => $incomeGrowth,
                        'isPositive' => $incomeGrowth >= 0
                    ],
                    'expenses' => [
                        'amount' => number_format($totalExpenses, 0),
                        'growth' => $expensesGrowth,
                        'isPositive' => false
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching payment stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching payment statistics'
            ], 500);
        }
    }
    
    /**
     * Helper method to get status styling
     */
    private function getStatusStyle($status)
    {
        $statusMap = [
            'completed' => [
                'color' => '#50AE31',
                'bg' => '#6DB4464D'
            ],
            'confirmed' => [
                'color' => '#0955AC',
                'bg' => '#0955AC4D'
            ],
            'pending' => [
                'color' => '#F0BB0D',
                'bg' => '#FFCD294D'
            ],
            'cancelled' => [
                'color' => '#FF0000',
                'bg' => '#FF00004D'
            ],
            'active' => [
                'color' => '#50AE31',
                'bg' => '#6DB4464D'
            ],
        ];
        
        return $statusMap[$status] ?? [
            'color' => '#7B7B7A',
            'bg' => '#7B7B7A4D'
        ];
    }
}