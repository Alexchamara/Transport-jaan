<?php

namespace App\Services;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;

class VehicleBookingCancellationService
{
    /**
     * Cancellation policy threshold (7 days)
     */
    private const CANCELLATION_DAYS_THRESHOLD = 7;

    /**
     * Full refund percentage (before 7 days)
     */
    private const FULL_REFUND_PERCENTAGE = 100;

    /**
     * Partial refund percentage (after 7 days)
     */
    private const PARTIAL_REFUND_PERCENTAGE = 50;

    /**
     * Calculate refund details based on cancellation policy
     *
     * @param Booking $booking
     * @param string $cancelledBy - 'client' or 'vendor'
     * @return array
     */
    public function calculateRefund(Booking $booking, string $cancelledBy = 'client'): array
    {
        $daysUntilPickup = $booking->getDaysUntilPickup();
        
        if ($daysUntilPickup === null) {
            throw new Exception('Cannot calculate refund: booking has no pickup date');
        }

        // Determine refund percentage based on days remaining
        // Using >= 7 to include the boundary day
        $refundPercentage = $daysUntilPickup >= (self::CANCELLATION_DAYS_THRESHOLD - 0.01)
            ? self::FULL_REFUND_PERCENTAGE 
            : self::PARTIAL_REFUND_PERCENTAGE;

        // Calculate refund amount (before any deductions)
        $refundAmount = ($booking->total_amount * $refundPercentage) / 100;
        $refundAmount = round($refundAmount, 2);

        // Calculate policy message
        $policyMessage = $this->getPolicyMessage(
            $daysUntilPickup, 
            $refundPercentage, 
            $cancelledBy
        );

        // Vendor commission handling
        $vendorCommissionRefund = 0; // Vendor gets no commission on cancellation
        $cancellationFee = $booking->total_amount - $refundAmount;

        return [
            'refund_amount' => $refundAmount,
            'refund_percentage' => $refundPercentage,
            'cancellation_fee' => round($cancellationFee, 2),
            'days_until_pickup' => round($daysUntilPickup, 2),
            'policy_message' => $policyMessage,
            'vendor_commission_refund' => $vendorCommissionRefund,
        ];
    }

    /**
     * Get user-friendly policy message
     *
     * @param float $daysUntilPickup
     * @param int $refundPercentage
     * @param string $cancelledBy
     * @return string
     */
    private function getPolicyMessage(float $daysUntilPickup, int $refundPercentage, string $cancelledBy): string
    {
        $actor = $cancelledBy === 'client' ? 'You' : 'Vendor';
        $days = $daysUntilPickup >= self::CANCELLATION_DAYS_THRESHOLD 
            ? "more than 7 days before pickup" 
            : "less than 7 days before pickup";

        if ($refundPercentage === 100) {
            return "$actor are cancelling $days and will receive 100% refund.";
        } else {
            return "$actor are cancelling $days and will receive 50% refund.";
        }
    }

    /**
     * Cancel a booking
     *
     * @param Booking $booking
     * @param string $cancelledBy - 'client' or 'vendor'
     * @param string|null $reason
     * @param int|null $userId - User making the cancellation (for validation)
     * @return array
     */
    public function cancelBooking(
        Booking $booking, 
        string $cancelledBy, 
        ?string $reason = null, 
        ?int $userId = null
    ): array
    {
        // Validation
        if (!in_array($cancelledBy, ['client', 'vendor'])) {
            throw new Exception('Invalid cancellation type. Must be "client" or "vendor".');
        }

        if ($booking->isCancelled()) {
            throw new Exception('This booking is already cancelled.');
        }

        if (!$booking->canBeCancelled()) {
            throw new Exception('This booking cannot be cancelled (status: ' . $booking->status . ').');
        }

        // Verify ownership for client cancellation
        if ($cancelledBy === 'client' && $userId && $booking->client_id !== $userId) {
            throw new Exception('You can only cancel your own bookings.');
        }

        // Verify vendor ownership for vendor cancellation
        if ($cancelledBy === 'vendor' && $userId) {
            $vendorId = $booking->vehicle->provider_id;
            if ($vendorId !== $userId) {
                throw new Exception('You can only cancel bookings for your vehicles.');
            }
        }

        try {
            return DB::transaction(function () use ($booking, $cancelledBy, $reason) {
                // Calculate refund
                $refundDetails = $this->calculateRefund($booking, $cancelledBy);

                // Update booking
                $booking->update([
                    'status' => 'cancelled',
                    'cancelled_at' => Carbon::now(),
                    'cancelled_by' => $cancelledBy,
                    'cancellation_reason' => $reason,
                    'refund_amount' => $refundDetails['refund_amount'],
                    'cancellation_fee' => $refundDetails['cancellation_fee'],
                    'vendor_commission_refund' => $refundDetails['vendor_commission_refund'],
                ]);

                return [
                    'success' => true,
                    'message' => ucfirst($cancelledBy) . ' cancellation processed successfully.',
                    'refund_details' => $refundDetails,
                    'booking' => $booking->fresh(),
                ];
            });
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Cancellation failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check if booking can be cancelled
     *
     * @param Booking $booking
     * @return bool
     */
    public function canCancel(Booking $booking): bool
    {
        return $booking->canBeCancelled() && !$booking->isCancelled();
    }

    /**
     * Get refund information without cancelling
     *
     * @param Booking $booking
     * @param string $cancelledBy
     * @return array
     */
    public function getRefundPreview(Booking $booking, string $cancelledBy = 'client'): array
    {
        try {
            $refundDetails = $this->calculateRefund($booking, $cancelledBy);
            
            return [
                'success' => true,
                'can_cancel' => $this->canCancel($booking),
                'refund_details' => $refundDetails,
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Cannot calculate refund: ' . $e->getMessage(),
            ];
        }
    }
}
