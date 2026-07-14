<?php

namespace App\Http\Controllers\Examples;

use App\Http\Controllers\Controller;
use App\Services\BookingCancellationService;
use App\Models\Booking;
use App\Models\Warehouse\WarehouseBooking;
use Illuminate\Http\Request;

class BookingCancellationExampleController extends Controller
{
    private BookingCancellationService $cancellationService;

    public function __construct(BookingCancellationService $cancellationService)
    {
        $this->cancellationService = $cancellationService;
    }

    /**
     * Example: Check if a vehicle booking can be cancelled
     */
    public function checkVehicleBookingCancellation($bookingId)
    {
        $booking = Booking::findOrFail($bookingId);
        
        $result = $this->cancellationService->canCancelBooking($booking, 'vehicle');
        
        return response()->json([
            'booking_id' => $bookingId,
            'booking_type' => 'vehicle',
            'cancellation_check' => $result
        ]);
    }

    /**
     * Example: Check if a warehouse booking can be cancelled
     */
    public function checkWarehouseBookingCancellation($bookingId)
    {
        $booking = WarehouseBooking::findOrFail($bookingId);
        
        $result = $this->cancellationService->canCancelBooking($booking, 'warehouse');
        
        return response()->json([
            'booking_id' => $bookingId,
            'booking_type' => 'warehouse',
            'cancellation_check' => $result
        ]);
    }

    /**
     * Example: Cancel a vehicle booking
     */
    public function cancelVehicleBooking(Request $request, $bookingId)
    {
        $booking = Booking::findOrFail($bookingId);
        
        $result = $this->cancellationService->cancelBooking(
            $booking, 
            'vehicle', 
            $request->input('reason', 'User requested cancellation')
        );
        
        if ($result['success']) {
            return response()->json($result, 200);
        } else {
            return response()->json($result, 422);
        }
    }

    /**
     * Example: Cancel a warehouse booking
     */
    public function cancelWarehouseBooking(Request $request, $bookingId)
    {
        $booking = WarehouseBooking::findOrFail($bookingId);
        
        $result = $this->cancellationService->cancelBooking(
            $booking, 
            'warehouse', 
            $request->input('reason', 'User requested cancellation')
        );
        
        if ($result['success']) {
            return response()->json($result, 200);
        } else {
            return response()->json($result, 422);
        }
    }

    /**
     * Example: Get all cancellation policies
     */
    public function getCancellationPolicies()
    {
        $policies = $this->cancellationService->getAllPolicies();
        
        return response()->json([
            'policies' => $policies,
            'last_updated' => now()
        ]);
    }

    /**
     * Example: Frontend booking page with cancellation info
     */
    public function showBookingWithCancellationInfo($bookingId, $type = 'vehicle')
    {
        if ($type === 'warehouse') {
            $booking = WarehouseBooking::findOrFail($bookingId);
        } else {
            $booking = Booking::findOrFail($bookingId);
        }
        
        $cancellationInfo = $this->cancellationService->canCancelBooking($booking, $type);
        $policy = $this->cancellationService->getCancellationPolicy($type);
        
        return response()->json([
            'booking' => $booking,
            'cancellation' => [
                'info' => $cancellationInfo,
                'policy' => $policy
            ]
        ]);
    }

    /**
     * Example: Bulk check cancellation status for multiple bookings
     */
    public function bulkCheckCancellations(Request $request)
    {
        $bookingIds = $request->input('booking_ids', []);
        $type = $request->input('type', 'vehicle'); // 'vehicle' or 'warehouse'
        
        $results = [];
        
        foreach ($bookingIds as $bookingId) {
            try {
                if ($type === 'warehouse') {
                    $booking = WarehouseBooking::find($bookingId);
                } else {
                    $booking = Booking::find($bookingId);
                }
                
                if ($booking) {
                    $cancellationInfo = $this->cancellationService->canCancelBooking($booking, $type);
                    $results[] = [
                        'booking_id' => $bookingId,
                        'can_cancel' => $cancellationInfo['can_cancel'],
                        'reason' => $cancellationInfo['reason'],
                        'days_until_start' => $cancellationInfo['days_until_start'] ?? null
                    ];
                } else {
                    $results[] = [
                        'booking_id' => $bookingId,
                        'error' => 'Booking not found'
                    ];
                }
            } catch (\Exception $e) {
                $results[] = [
                    'booking_id' => $bookingId,
                    'error' => $e->getMessage()
                ];
            }
        }
        
        return response()->json([
            'type' => $type,
            'results' => $results,
            'policy' => $this->cancellationService->getCancellationPolicy($type)
        ]);
    }
}

/* 
EXAMPLE USAGE:

1. Check if a vehicle booking can be cancelled:
   GET /api/bookings/vehicle/{id}/cancellation-check
   
2. Check if a warehouse booking can be cancelled:
   GET /api/bookings/warehouse/{id}/cancellation-check

3. Cancel a vehicle booking:
   POST /api/bookings/vehicle/{id}/cancel
   Body: {"reason": "Changed travel plans"}

4. Cancel a warehouse booking:
   POST /api/bookings/warehouse/{id}/cancel
   Body: {"reason": "No longer need storage"}

5. Get all cancellation policies:
   GET /api/cancellation-policies

6. Frontend integration example:
   GET /api/bookings/{id}/with-cancellation-info?type=vehicle

EXAMPLE RESPONSE for cancellation check:
{
  "booking_id": 123,
  "booking_type": "vehicle", 
  "cancellation_check": {
    "can_cancel": true,
    "allowed_days": 2,
    "hours_until_start": 72.5,
    "days_until_start": 3.0,
    "booking_start_date": "2026-01-11 10:00:00",
    "deadline_passed": false,
    "context": "vehicle",
    "reason": "Booking can be cancelled. 3.0 days remaining until deadline."
  }
}

EXAMPLE RESPONSE for cancellation attempt:
{
  "success": true,
  "message": "Booking cancelled successfully",
  "booking_id": 123,
  "policy_info": {
    "can_cancel": true,
    "allowed_days": 2,
    "context": "vehicle"
  }
}
*/