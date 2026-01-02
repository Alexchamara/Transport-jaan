<?php

namespace App\Services;

use App\Models\BusSchedule;
use App\Models\TrainSchedule;
use App\Models\BusBooking;
use App\Models\TrainBooking;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

/**
 * Business Validation Service
 * 
 * Centralizes all booking business logic validation:
 * - Past date prevention
 * - Capacity validation
 * - Schedule status checks
 * - Seat availability
 * - Overbooking prevention
 */
class BookingValidationService
{
    /**
     * Validate bus schedule booking
     * 
     * @param BusSchedule $schedule
     * @param array $bookingData
     * @throws ValidationException
     * @return array Validation result
     */
    public static function validateBusBooking(BusSchedule $schedule, array $bookingData): array
    {
        $errors = [];
        $warnings = [];

        // 1. Schedule existence and status
        if (!$schedule) {
            throw ValidationException::withMessages([
                'schedule' => ['Schedule not found.']
            ]);
        }

        if ($schedule->status !== 'active') {
            $errors['schedule'] = "This schedule is {$schedule->status} and not available for booking.";
        }

        // 2. Past date validation
        $scheduleDate = Carbon::parse($schedule->date);
        // Extract time only from departure_time (it may be a Carbon datetime object)
        $departureTime = $schedule->departure_time instanceof Carbon 
            ? $schedule->departure_time->format('H:i:s') 
            : ($schedule->departure_time ?? '00:00:00');
        $scheduleDatetime = Carbon::parse($schedule->date)->setTimeFromTimeString($departureTime);
        
        if ($scheduleDatetime->isPast()) {
            $errors['date'] = 'Cannot book a schedule in the past.';
        }
        
        // Warning if booking very soon (less than 30 minutes)
        if ($scheduleDatetime->isFuture() && $scheduleDatetime->diffInMinutes(now()) < 30) {
            $warnings['time'] = 'This bus departs in less than 30 minutes. Please arrive early.';
        }

        // 3. Capacity validation
        $requestedSeats = $bookingData['passenger_count'] ?? 0;
        $seatNumbers = $bookingData['seat_numbers'] ?? [];
        
        if ($requestedSeats <= 0) {
            $errors['capacity'] = 'At least 1 passenger is required.';
        }

        if ($requestedSeats > $schedule->available_seats) {
            $errors['capacity'] = "Only {$schedule->available_seats} seat(s) available. You requested {$requestedSeats}.";
        }

        // 4. Bus capacity check
        $busCapacity = $schedule->bus->capacity ?? 50;
        if ($requestedSeats > $busCapacity) {
            $errors['capacity'] = "Total passengers ({$requestedSeats}) exceeds bus capacity ({$busCapacity}).";
        }

        // 5. Seat number validation
        if (!empty($seatNumbers)) {
            if (count($seatNumbers) !== $requestedSeats) {
                $errors['seats'] = 'Number of selected seats must match passenger count.';
            }

            // Check for invalid seat numbers
            foreach ($seatNumbers as $seatNum) {
                if (!is_numeric($seatNum) || $seatNum < 1 || $seatNum > $busCapacity) {
                    $errors['seats'] = "Invalid seat number: {$seatNum}. Valid range: 1-{$busCapacity}.";
                    break;
                }
            }

            // Check for duplicate seat selections
            if (count($seatNumbers) !== count(array_unique($seatNumbers))) {
                $errors['seats'] = 'Duplicate seat numbers selected.';
            }
        }

        // 6. Check for overbooking scenario
        $totalBooked = BusBooking::where('bus_schedule_id', $schedule->id)
            ->whereIn('status', ['confirmed', 'pending'])
            ->sum('passenger_count');

        $totalAfterBooking = $totalBooked + $requestedSeats;
        if ($totalAfterBooking > $busCapacity) {
            $errors['overbooking'] = 'This booking would exceed bus capacity. Please contact support.';
        }

        // 7. Seat collision check
        if (!empty($seatNumbers)) {
            $bookedSeats = BusBooking::where('bus_schedule_id', $schedule->id)
                ->whereIn('status', ['confirmed', 'pending'])
                ->get()
                ->pluck('seat_numbers')
                ->flatten()
                ->toArray();

            $conflicts = array_intersect($seatNumbers, $bookedSeats);
            if (!empty($conflicts)) {
                $errors['seat_conflict'] = 'Seats already booked: ' . implode(', ', $conflicts);
            }
        }

        // 8. Maximum booking per user check (prevent abuse)
        if (isset($bookingData['user_id'])) {
            $userBookingsCount = BusBooking::where('user_id', $bookingData['user_id'])
                ->where('bus_schedule_id', $schedule->id)
                ->whereIn('status', ['confirmed', 'pending'])
                ->count();

            if ($userBookingsCount >= 5) {
                $errors['user_limit'] = 'You have reached the maximum bookings (5) for this schedule.';
            }
        }

        // Throw exception if there are errors
        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }

        return [
            'valid' => true,
            'warnings' => $warnings,
            'available_seats' => $schedule->available_seats,
            'total_capacity' => $busCapacity,
            'departure_datetime' => $scheduleDatetime,
        ];
    }

    /**
     * Validate train schedule booking
     * 
     * @param TrainSchedule $schedule
     * @param array $bookingData
     * @throws ValidationException
     * @return array Validation result
     */
    public static function validateTrainBooking(TrainSchedule $schedule, array $bookingData): array
    {
        $errors = [];
        $warnings = [];

        // 1. Schedule existence and status
        if (!$schedule) {
            throw ValidationException::withMessages([
                'schedule' => ['Schedule not found.']
            ]);
        }

        if ($schedule->status !== 'active') {
            $errors['schedule'] = "This schedule is {$schedule->status} and not available for booking.";
        }

        // 2. Past date validation
        $scheduleDate = Carbon::parse($schedule->date);
        // Extract time only from departure_time (it may be a Carbon datetime object)
        $departureTime = $schedule->departure_time instanceof Carbon 
            ? $schedule->departure_time->format('H:i:s') 
            : ($schedule->departure_time ?? '00:00:00');
        $scheduleDatetime = Carbon::parse($schedule->date)->setTimeFromTimeString($departureTime);
        
        if ($scheduleDatetime->isPast()) {
            $errors['date'] = 'Cannot book a schedule in the past.';
        }

        // Warning if booking very soon
        if ($scheduleDatetime->isFuture() && $scheduleDatetime->diffInMinutes(now()) < 60) {
            $warnings['time'] = 'This train departs in less than 1 hour. Please arrive early.';
        }

        // 3. Passenger validation
        $adults = $bookingData['adults'] ?? 0;
        $children = $bookingData['children'] ?? 0;
        $infants = $bookingData['infants'] ?? 0;
        $totalPassengers = $adults + $children + $infants;

        if ($adults < 1) {
            $errors['passengers'] = 'At least 1 adult passenger is required.';
        }

        if ($totalPassengers <= 0) {
            $errors['passengers'] = 'At least 1 passenger is required.';
        }

        // 4. Capacity validation
        if ($totalPassengers > $schedule->available_seats) {
            $errors['capacity'] = "Only {$schedule->available_seats} seat(s) available. You requested {$totalPassengers}.";
        }

        // 5. Train capacity check
        $trainCapacity = $schedule->train->capacity ?? 100;
        if ($totalPassengers > $trainCapacity) {
            $errors['capacity'] = "Total passengers ({$totalPassengers}) exceeds train capacity ({$trainCapacity}).";
        }

        // 6. Check for overbooking
        $totalBooked = TrainBooking::where('train_schedule_id', $schedule->id)
            ->whereIn('status', ['confirmed', 'pending'])
            ->sum('total_passengers');

        $totalAfterBooking = $totalBooked + $totalPassengers;
        if ($totalAfterBooking > $trainCapacity) {
            $errors['overbooking'] = 'This booking would exceed train capacity. Please contact support.';
        }

        // 7. Infant validation (can't exceed adults)
        if ($infants > $adults) {
            $errors['infants'] = 'Number of infants cannot exceed number of adults.';
        }

        // 8. Maximum passengers per booking
        if ($totalPassengers > 10) {
            $errors['max_passengers'] = 'Maximum 10 passengers per booking. For group bookings, please contact support.';
        }

        // 9. User booking limit
        if (isset($bookingData['user_id'])) {
            $userBookingsCount = TrainBooking::where('user_id', $bookingData['user_id'])
                ->where('train_schedule_id', $schedule->id)
                ->whereIn('status', ['confirmed', 'pending'])
                ->count();

            if ($userBookingsCount >= 3) {
                $errors['user_limit'] = 'You have reached the maximum bookings (3) for this schedule.';
            }
        }

        // Throw exception if there are errors
        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }

        return [
            'valid' => true,
            'warnings' => $warnings,
            'available_seats' => $schedule->available_seats,
            'total_capacity' => $trainCapacity,
            'departure_datetime' => $scheduleDatetime,
            'total_passengers' => $totalPassengers,
        ];
    }

    /**
     * Check if a schedule date is bookable
     * 
     * @param string $date
     * @param string|null $time
     * @return bool
     */
    public static function isDateBookable(string $date, ?string $time = null): bool
    {
        $scheduleDate = Carbon::parse($date);
        
        if ($time) {
            $scheduleDatetime = Carbon::parse($date . ' ' . $time);
            return $scheduleDatetime->isFuture();
        }
        
        return $scheduleDate->isToday() || $scheduleDate->isFuture();
    }

    /**
     * Get available capacity for a schedule
     * 
     * @param string $type 'bus' or 'train'
     * @param int $scheduleId
     * @return array
     */
    public static function getAvailableCapacity(string $type, int $scheduleId): array
    {
        if ($type === 'bus') {
            $schedule = BusSchedule::with('bus')->find($scheduleId);
            if (!$schedule) {
                return ['available' => 0, 'total' => 0, 'booked' => 0];
            }

            $totalCapacity = $schedule->bus->capacity ?? 50;
            $bookedSeats = BusBooking::where('bus_schedule_id', $scheduleId)
                ->whereIn('status', ['confirmed', 'pending'])
                ->sum('passenger_count');

            return [
                'available' => max(0, $schedule->available_seats),
                'total' => $totalCapacity,
                'booked' => $bookedSeats,
                'percentage_full' => round(($bookedSeats / $totalCapacity) * 100, 1),
            ];
        }

        if ($type === 'train') {
            $schedule = TrainSchedule::with('train')->find($scheduleId);
            if (!$schedule) {
                return ['available' => 0, 'total' => 0, 'booked' => 0];
            }

            $totalCapacity = $schedule->train->capacity ?? 100;
            $bookedSeats = TrainBooking::where('train_schedule_id', $scheduleId)
                ->whereIn('status', ['confirmed', 'pending'])
                ->sum('total_passengers');

            return [
                'available' => max(0, $schedule->available_seats),
                'total' => $totalCapacity,
                'booked' => $bookedSeats,
                'percentage_full' => round(($bookedSeats / $totalCapacity) * 100, 1),
            ];
        }

        return ['available' => 0, 'total' => 0, 'booked' => 0];
    }
}
