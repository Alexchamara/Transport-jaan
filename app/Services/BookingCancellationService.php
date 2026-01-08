<?php

namespace App\Services;

use App\Models\CancellationSetting;
use App\Models\Booking;
use App\Models\Warehouse\WarehouseBooking;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class BookingCancellationService
{
    /**
     * Check if a booking can be cancelled based on the configured cancellation policy
     * 
     * @param Model $booking - The booking instance (Booking or WarehouseBooking)
     * @param string|null $context - 'vehicle' or 'warehouse' (auto-detected if null)
     * @return array
     */
    public function canCancelBooking(Model $booking, ?string $context = null): array
    {
        // Auto-detect context if not provided
        if (!$context) {
            $context = $this->detectBookingContext($booking);
        }

        // Get the cancellation policy for this context
        $allowedDays = CancellationSetting::getDaysForContext($context);

        // Get the booking start date
        $bookingStartDate = $this->getBookingStartDate($booking, $context);
        
        if (!$bookingStartDate) {
            return [
                'can_cancel' => false,
                'reason' => 'Unable to determine booking start date',
                'allowed_days' => $allowedDays,
                'hours_until_start' => null,
                'deadline_passed' => true
            ];
        }

        // Calculate hours until booking starts
        $now = Carbon::now();
        $hoursUntilStart = $now->diffInHours($bookingStartDate, false);
        $daysUntilStart = $hoursUntilStart / 24;

        // Check if we're past the cancellation deadline
        $deadlinePassed = $daysUntilStart < $allowedDays;

        // Build response
        $response = [
            'can_cancel' => !$deadlinePassed,
            'allowed_days' => $allowedDays,
            'hours_until_start' => round($hoursUntilStart, 1),
            'days_until_start' => round($daysUntilStart, 1),
            'booking_start_date' => $bookingStartDate->toDateTimeString(),
            'deadline_passed' => $deadlinePassed,
            'context' => $context
        ];

        if ($deadlinePassed) {
            if ($allowedDays === 0) {
                $response['reason'] = 'Same-day cancellation not allowed for this booking';
            } else {
                $response['reason'] = "Cancellation deadline passed. Must cancel at least {$allowedDays} " . 
                                    ($allowedDays === 1 ? 'day' : 'days') . ' before booking start date.';
            }
        } else {
            if ($allowedDays === 0) {
                $response['reason'] = 'Booking can be cancelled (same-day cancellation allowed)';
            } else {
                $remainingDays = round($daysUntilStart, 1);
                $response['reason'] = "Booking can be cancelled. {$remainingDays} " . 
                                    ($remainingDays == 1 ? 'day' : 'days') . ' remaining until deadline.';
            }
        }

        return $response;
    }

    /**
     * Cancel a booking with policy validation
     * 
     * @param Model $booking
     * @param string|null $context
     * @param string|null $cancellationReason
     * @return array
     */
    public function cancelBooking(Model $booking, ?string $context = null, ?string $cancellationReason = null): array
    {
        $canCancelResult = $this->canCancelBooking($booking, $context);
        
        if (!$canCancelResult['can_cancel']) {
            return [
                'success' => false,
                'message' => $canCancelResult['reason'],
                'policy_info' => $canCancelResult
            ];
        }

        try {
            // Update booking status
            $booking->update([
                'status' => 'cancelled',
                'cancelled_at' => Carbon::now(),
                'cancellation_reason' => $cancellationReason ?? 'Cancelled by user'
            ]);

            // Log the cancellation (you might want to create a cancellation log table)
            $this->logCancellation($booking, $canCancelResult, $cancellationReason);

            return [
                'success' => true,
                'message' => 'Booking cancelled successfully',
                'booking_id' => $booking->id,
                'policy_info' => $canCancelResult
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to cancel booking: ' . $e->getMessage(),
                'policy_info' => $canCancelResult
            ];
        }
    }

    /**
     * Get booking cancellation policy information for display
     * 
     * @param string $context
     * @return array
     */
    public function getCancellationPolicy(string $context): array
    {
        $allowedDays = CancellationSetting::getDaysForContext($context);
        
        return [
            'context' => $context,
            'allowed_days' => $allowedDays,
            'policy_text' => $this->getPolicyText($allowedDays),
            'applies_to' => $context === 'vehicle' ? 'Vehicle Bookings' : 'Warehouse Bookings'
        ];
    }

    /**
     * Get all active cancellation policies
     * 
     * @return array
     */
    public function getAllPolicies(): array
    {
        return [
            'vehicle' => $this->getCancellationPolicy('vehicle'),
            'warehouse' => $this->getCancellationPolicy('warehouse')
        ];
    }

    /**
     * Auto-detect booking context based on model type
     * 
     * @param Model $booking
     * @return string
     */
    private function detectBookingContext(Model $booking): string
    {
        if ($booking instanceof WarehouseBooking) {
            return 'warehouse';
        }
        
        // Default to vehicle for regular bookings and other vehicle-related bookings
        return 'vehicle';
    }

    /**
     * Get the booking start date based on context
     * 
     * @param Model $booking
     * @param string $context
     * @return Carbon|null
     */
    private function getBookingStartDate(Model $booking, string $context): ?Carbon
    {
        try {
            if ($context === 'warehouse' && $booking instanceof WarehouseBooking) {
                // For warehouse bookings, use start_date
                return $booking->start_date ? Carbon::parse($booking->start_date) : null;
            } elseif ($context === 'vehicle' && $booking instanceof Booking) {
                // For vehicle bookings, use pickup date from schedule
                return $booking->start_date; // This uses the accessor which returns pickup_at
            }
            
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Generate human-readable policy text
     * 
     * @param int $allowedDays
     * @return string
     */
    private function getPolicyText(int $allowedDays): string
    {
        if ($allowedDays === 0) {
            return 'Same-day cancellation allowed';
        } elseif ($allowedDays === 1) {
            return 'Must cancel at least 1 day before booking starts';
        } else {
            return "Must cancel at least {$allowedDays} days before booking starts";
        }
    }

    /**
     * Log booking cancellation for audit trail
     * 
     * @param Model $booking
     * @param array $policyInfo
     * @param string|null $reason
     */
    private function logCancellation(Model $booking, array $policyInfo, ?string $reason): void
    {
        // You might want to create a booking_cancellations table for this
        // For now, we'll just log it to the application log
        logger()->info('Booking cancelled', [
            'booking_id' => $booking->id,
            'booking_type' => get_class($booking),
            'context' => $policyInfo['context'],
            'policy_days' => $policyInfo['allowed_days'],
            'days_until_start' => $policyInfo['days_until_start'],
            'reason' => $reason,
            'cancelled_at' => now()
        ]);
    }
}