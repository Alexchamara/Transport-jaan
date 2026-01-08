<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Warehouse\WarehouseBooking;
use App\Models\WarehouseBookingCancellation;
use App\Models\CancellationSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WarehouseBookingCancellationController extends Controller
{
    /**
     * Calculate refund percentage based on cancellation window
     * 
     * @param Carbon $bookingStartDate
     * @param int $allowedDays
     * @return array
     */
    private function calculateRefund(Carbon $bookingStartDate, int $allowedDays): array
    {
        // Use start of day for both dates to ignore time components
        $today = Carbon::now()->startOfDay();
        $bookingDate = $bookingStartDate->copy()->startOfDay();
        
        // Calculate full calendar days between today and booking date
        $daysBeforeBooking = $today->diffInDays($bookingDate, false);
        
        // If booking date is in the past, no refund
        if ($daysBeforeBooking < 0) {
            return [
                'percentage' => 0,
                'days_before' => $daysBeforeBooking,
                'within_window' => false,
                'reason' => 'Booking date has passed'
            ];
        }
        
        // If cancelling within the allowed window, 100% refund
        // Use >= to include the exact day (e.g., 7 days means cancel 7 or more days before)
        if ($daysBeforeBooking >= $allowedDays) {
            return [
                'percentage' => 100,
                'days_before' => $daysBeforeBooking,
                'within_window' => true,
                'reason' => "Cancelled {$daysBeforeBooking} days before booking (allowed: {$allowedDays} days)"
            ];
        }
        
        // Otherwise, 50% refund
        return [
            'percentage' => 50,
            'days_before' => $daysBeforeBooking,
            'within_window' => false,
            'reason' => "Cancelled {$daysBeforeBooking} days before booking (required: {$allowedDays} days for full refund)"
        ];
    }

    /**
     * Cancel a warehouse booking
     */
    public function cancel(Request $request, $id)
    {
        try {
            $request->validate([
                'reason' => 'nullable|string|max:500'
            ]);

            // Find the booking
            $booking = WarehouseBooking::findOrFail($id);
            
            // Verify ownership - booking must belong to authenticated user
            if ($booking->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. This booking does not belong to you.'
                ], 403);
            }

            // Check if booking can be cancelled
            if (!$booking->canBeCancelled()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This booking cannot be cancelled. Status: ' . $booking->status
                ], 422);
            }

            // Check if already cancelled
            if ($booking->isCancelled()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This booking has already been cancelled.'
                ], 422);
            }

            // Get cancellation policy settings from DB
            $allowedDays = CancellationSetting::getDaysForContext('warehouse');
            
            // Calculate refund
            $bookingStartDate = Carbon::parse($booking->start_date);
            $refundInfo = $this->calculateRefund($bookingStartDate, $allowedDays);
            
            // Calculate refund amount
            $originalAmount = $booking->final_amount ?? $booking->total_amount ?? 0;
            $refundAmount = ($originalAmount * $refundInfo['percentage']) / 100;

            DB::beginTransaction();
            
            try {
                // Update booking status
                $booking->update([
                    'status' => 'cancelled',
                    'cancelled_by' => 'customer',
                    'cancelled_at' => now(),
                    'refund_percentage' => $refundInfo['percentage'],
                    'refund_amount' => $refundAmount,
                ]);

                // Create cancellation record for audit trail
                WarehouseBookingCancellation::create([
                    'warehouse_booking_id' => $booking->id,
                    'user_id' => auth()->id(),
                    'cancelled_by' => 'customer',
                    'cancellation_reason' => $request->input('reason', 'Customer requested cancellation'),
                    'booking_start_date' => $bookingStartDate->toDateString(),
                    'cancellation_date' => now()->toDateString(),
                    'days_before_booking' => $refundInfo['days_before'],
                    'allowed_cancellation_days' => $allowedDays,
                    'refund_percentage' => $refundInfo['percentage'],
                    'original_amount' => $originalAmount,
                    'refund_amount' => $refundAmount,
                    'refund_status' => 'pending',
                ]);

                DB::commit();

                // Log the cancellation
                Log::info('Warehouse booking cancelled', [
                    'booking_id' => $booking->id,
                    'user_id' => auth()->id(),
                    'refund_percentage' => $refundInfo['percentage'],
                    'refund_amount' => $refundAmount,
                    'days_before_booking' => $refundInfo['days_before']
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Booking cancelled successfully',
                    'data' => [
                        'booking_id' => $booking->id,
                        'refund_percentage' => $refundInfo['percentage'],
                        'refund_amount' => number_format($refundAmount, 2),
                        'refund_status' => 'pending',
                        'refund_info' => $refundInfo['reason'],
                        'cancelled_at' => $booking->cancelled_at->toDateTimeString(),
                    ]
                ], 200);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.'
            ], 404);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            Log::error('Warehouse booking cancellation failed', [
                'booking_id' => $id,
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel booking. Please try again or contact support.'
            ], 500);
        }
    }

    /**
     * Get cancellation preview information (before actual cancellation)
     */
    public function preview($id)
    {
        try {
            $booking = WarehouseBooking::findOrFail($id);
            
            // Verify ownership
            if ($booking->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Check if can be cancelled
            if (!$booking->canBeCancelled()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This booking cannot be cancelled',
                    'can_cancel' => false
                ], 422);
            }

            // Get cancellation policy
            $allowedDays = CancellationSetting::getDaysForContext('warehouse');
            
            // Calculate refund
            $bookingStartDate = Carbon::parse($booking->start_date);
            $refundInfo = $this->calculateRefund($bookingStartDate, $allowedDays);
            
            // Calculate amounts
            $originalAmount = $booking->final_amount ?? $booking->total_amount ?? 0;
            $refundAmount = ($originalAmount * $refundInfo['percentage']) / 100;

            return response()->json([
                'success' => true,
                'can_cancel' => true,
                'data' => [
                    'booking_id' => $booking->id,
                    'booking_reference' => $booking->booking_reference,
                    'booking_start_date' => $bookingStartDate->toDateString(),
                    'days_before_booking' => $refundInfo['days_before'],
                    'allowed_cancellation_days' => $allowedDays,
                    'refund_percentage' => $refundInfo['percentage'],
                    'original_amount' => number_format($originalAmount, 2),
                    'refund_amount' => number_format($refundAmount, 2),
                    'within_window' => $refundInfo['within_window'],
                    'reason' => $refundInfo['reason'],
                    'policy_text' => $allowedDays === 0 
                        ? 'Same-day cancellation allowed' 
                        : "Cancel {$allowedDays} or more days before booking for 100% refund, otherwise 50% refund"
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get cancellation preview'
            ], 500);
        }
    }
}
