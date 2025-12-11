<?php

namespace App\Services;

use App\Models\BusBooking;
use App\Models\TrainBooking;
use App\Models\FlightBooking;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Cancellation Policy Service
 * 
 * Handles booking cancellations with automated refund calculation
 * based on time remaining before departure.
 * 
 * Refund Policy:
 * - 48+ hours: 90% refund (10% admin fee)
 * - 24-48 hours: 75% refund (25% cancellation fee)
 * - 12-24 hours: 50% refund (50% cancellation fee)
 * - 6-12 hours: 25% refund (75% cancellation fee)
 * - <6 hours: 0% refund (no refund)
 * - After departure: 0% refund
 */
class CancellationPolicyService
{
    /**
     * Calculate refund amount based on cancellation time
     *
     * @param string $bookingType (bus|train|flight)
     * @param mixed $booking
     * @return array ['refund_amount', 'refund_percentage', 'cancellation_fee', 'hours_before_departure']
     */
    public function calculateRefund(string $bookingType, $booking): array
    {
        $departureTime = $this->getDepartureTime($bookingType, $booking);
        $hoursBeforeDeparture = now()->diffInHours($departureTime, false);
        
        // If departure has passed, no refund
        if ($hoursBeforeDeparture < 0) {
            return [
                'refund_amount' => 0,
                'refund_percentage' => 0,
                'cancellation_fee' => $booking->total_price ?? 0,
                'hours_before_departure' => $hoursBeforeDeparture,
                'policy_message' => 'No refund available after departure time'
            ];
        }
        
        $totalPrice = $booking->total_price ?? 0;
        $refundPercentage = $this->getRefundPercentage($hoursBeforeDeparture);
        $refundAmount = $totalPrice * ($refundPercentage / 100);
        $cancellationFee = $totalPrice - $refundAmount;
        
        return [
            'refund_amount' => round($refundAmount, 2),
            'refund_percentage' => $refundPercentage,
            'cancellation_fee' => round($cancellationFee, 2),
            'hours_before_departure' => round($hoursBeforeDeparture, 1),
            'policy_message' => $this->getPolicyMessage($hoursBeforeDeparture, $refundPercentage)
        ];
    }
    
    /**
     * Cancel a booking with refund calculation
     *
     * @param string $bookingType
     * @param string $reference
     * @param int $userId
     * @param string|null $reason
     * @return array ['success', 'message', 'refund_details']
     */
    public function cancelBooking(string $bookingType, string $reference, int $userId, ?string $reason = null): array
    {
        try {
            return DB::transaction(function () use ($bookingType, $reference, $userId, $reason) {
                // Get booking
                $booking = $this->getBooking($bookingType, $reference);
                
                if (!$booking) {
                    throw ValidationException::withMessages([
                        'booking' => ['Booking not found']
                    ]);
                }
                
                // Verify ownership
                if ($booking->user_id !== $userId) {
                    throw ValidationException::withMessages([
                        'booking' => ['Unauthorized access to booking']
                    ]);
                }
                
                // Check if already cancelled
                if ($booking->status === 'cancelled') {
                    throw ValidationException::withMessages([
                        'booking' => ['Booking is already cancelled']
                    ]);
                }
                
                // Check if booking is confirmed/pending
                if (!in_array($booking->status, ['confirmed', 'pending'])) {
                    throw ValidationException::withMessages([
                        'booking' => ['Only confirmed or pending bookings can be cancelled']
                    ]);
                }
                
                // Calculate refund
                $refundDetails = $this->calculateRefund($bookingType, $booking);
                
                // Update booking status
                $booking->status = 'cancelled';
                $booking->cancelled_at = now();
                $booking->cancellation_reason = $reason;
                $booking->refund_amount = $refundDetails['refund_amount'];
                $booking->cancellation_fee = $refundDetails['cancellation_fee'];
                $booking->save();
                
                // Release seats back to schedule
                $this->releaseSeats($bookingType, $booking);
                
                Log::info('Booking cancelled successfully', [
                    'type' => $bookingType,
                    'reference' => $reference,
                    'refund_amount' => $refundDetails['refund_amount'],
                    'cancellation_fee' => $refundDetails['cancellation_fee']
                ]);
                
                return [
                    'success' => true,
                    'message' => 'Booking cancelled successfully',
                    'refund_details' => $refundDetails,
                    'booking' => $booking
                ];
            });
            
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Booking cancellation failed', [
                'type' => $bookingType,
                'reference' => $reference,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
    
    /**
     * Get refund percentage based on hours before departure
     *
     * @param float $hours
     * @return int
     */
    public function getRefundPercentage(float $hours): int
    {
        if ($hours >= 48) {
            return 90; // 48+ hours: 90% refund
        } elseif ($hours >= 24) {
            return 75; // 24-48 hours: 75% refund
        } elseif ($hours >= 12) {
            return 50; // 12-24 hours: 50% refund
        } elseif ($hours >= 6) {
            return 25; // 6-12 hours: 25% refund
        } else {
            return 0; // Less than 6 hours: No refund
        }
    }
    
    /**
     * Get policy message for user
     *
     * @param float $hours
     * @param int $percentage
     * @return string
     */
    protected function getPolicyMessage(float $hours, int $percentage): string
    {
        if ($hours >= 48) {
            return "Cancelling 48+ hours before departure. You'll receive a {$percentage}% refund (10% admin fee).";
        } elseif ($hours >= 24) {
            return "Cancelling 24-48 hours before departure. You'll receive a {$percentage}% refund (25% cancellation fee).";
        } elseif ($hours >= 12) {
            return "Cancelling 12-24 hours before departure. You'll receive a {$percentage}% refund (50% cancellation fee).";
        } elseif ($hours >= 6) {
            return "Cancelling 6-12 hours before departure. You'll receive a {$percentage}% refund (75% cancellation fee).";
        } else {
            return "Cancelling less than 6 hours before departure. No refund available.";
        }
    }
    
    /**
     * Get departure time for booking
     *
     * @param string $bookingType
     * @param mixed $booking
     * @return Carbon
     */
    protected function getDepartureTime(string $bookingType, $booking): Carbon
    {
        switch ($bookingType) {
            case 'bus':
                $schedule = $booking->busSchedule;
                // Handle date and time parsing
                $date = $schedule->date instanceof Carbon ? $schedule->date->format('Y-m-d') : Carbon::parse($schedule->date)->format('Y-m-d');
                $time = is_string($schedule->departure_time) ? $schedule->departure_time : Carbon::parse($schedule->departure_time)->format('H:i:s');
                return Carbon::parse($date . ' ' . $time);
                
            case 'train':
                $schedule = $booking->trainSchedule;
                // Handle date and time parsing
                $date = $schedule->date instanceof Carbon ? $schedule->date->format('Y-m-d') : Carbon::parse($schedule->date)->format('Y-m-d');
                $time = is_string($schedule->departure_time) ? $schedule->departure_time : Carbon::parse($schedule->departure_time)->format('H:i:s');
                return Carbon::parse($date . ' ' . $time);
                
            case 'flight':
                return Carbon::parse($booking->departure_time ?? $booking->departure_date);
                
            default:
                throw new \InvalidArgumentException("Invalid booking type: {$bookingType}");
        }
    }
    
    /**
     * Get booking by reference
     *
     * @param string $bookingType
     * @param string $reference
     * @return mixed
     */
    protected function getBooking(string $bookingType, string $reference)
    {
        switch ($bookingType) {
            case 'bus':
                return BusBooking::with('busSchedule')->where('booking_reference', $reference)->first();
                
            case 'train':
                return TrainBooking::with('trainSchedule')->where('booking_reference', $reference)->first();
                
            case 'flight':
                return FlightBooking::where('booking_reference', $reference)->first();
                
            default:
                return null;
        }
    }
    
    /**
     * Release seats back to schedule
     *
     * @param string $bookingType
     * @param mixed $booking
     */
    protected function releaseSeats(string $bookingType, $booking): void
    {
        switch ($bookingType) {
            case 'bus':
                if ($booking->busSchedule) {
                    $booking->busSchedule->increment('available_seats', $booking->passenger_count);
                }
                break;
                
            case 'train':
                if ($booking->trainSchedule) {
                    $booking->trainSchedule->increment('available_seats', $booking->total_passengers ?? $booking->passenger_count);
                }
                break;
                
            case 'flight':
                // Flight bookings may not have seat tracking
                break;
        }
    }
    
    /**
     * Check if booking can be cancelled
     *
     * @param string $bookingType
     * @param mixed $booking
     * @return array ['can_cancel' => bool, 'reason' => string]
     */
    public function canCancel(string $bookingType, $booking): array
    {
        if (!$booking) {
            return ['can_cancel' => false, 'reason' => 'Booking not found'];
        }
        
        if ($booking->status === 'cancelled') {
            return ['can_cancel' => false, 'reason' => 'Booking is already cancelled'];
        }
        
        if (!in_array($booking->status, ['confirmed', 'pending'])) {
            return ['can_cancel' => false, 'reason' => 'Only confirmed or pending bookings can be cancelled'];
        }
        
        $departureTime = $this->getDepartureTime($bookingType, $booking);
        if ($departureTime->isPast()) {
            return ['can_cancel' => false, 'reason' => 'Cannot cancel after departure time'];
        }
        
        return ['can_cancel' => true, 'reason' => ''];
    }
}
