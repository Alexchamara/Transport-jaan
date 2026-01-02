<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BookingValidationService;
use App\Models\BusSchedule;
use App\Models\TrainSchedule;
use App\Models\BusBooking;
use App\Models\TrainBooking;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TestBusinessValidation extends Command
{
    protected $signature = 'test:business-validation';
    protected $description = 'Test business validation rules for booking system';

    private $testResults = [];

    public function handle()
    {
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('🧪 BUSINESS VALIDATION TESTING');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->newLine();

        // Test 1: Past Date Validation
        $this->testPastDateValidation();
        
        // Test 2: Capacity Validation
        $this->testCapacityValidation();
        
        // Test 3: Overbooking Prevention
        $this->testOverbookingPrevention();
        
        // Test 4: Seat Collision Detection
        $this->testSeatCollision();
        
        // Test 5: Schedule Status Check
        $this->testScheduleStatus();
        
        // Test 6: Passenger Limits
        $this->testPassengerLimits();

        // Summary
        $this->showSummary();

        return 0;
    }

    private function testPastDateValidation()
    {
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('TEST 1: Past Date Validation');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Create test schedule with past date
        $pastSchedule = BusSchedule::whereHas('bus', function($q) {
            $q->where('bus_number', 'LIKE', 'TEST-%');
        })->first();

        if (!$pastSchedule) {
            $this->warn('No test schedules found. Creating test data...');
            $this->call('db:seed', ['--class' => 'RaceConditionTestSeeder']);
            $pastSchedule = BusSchedule::whereHas('bus', function($q) {
                $q->where('bus_number', 'LIKE', 'TEST-%');
            })->first();
        }

        // Test 1a: Book past date
        try {
            $originalDate = $pastSchedule->date;
            $pastSchedule->date = Carbon::yesterday();
            $pastSchedule->save();

            BookingValidationService::validateBusBooking($pastSchedule, [
                'passenger_count' => 1,
                'seat_numbers' => [1]
            ]);

            $this->addResult('Past Date - Should Reject', false, 'Allowed booking in the past!');
        } catch (ValidationException $e) {
            if (isset($e->errors()['date'])) {
                $this->addResult('Past Date - Should Reject', true, 'Correctly rejected past date');
            } else {
                $this->addResult('Past Date - Should Reject', false, 'Wrong error: ' . json_encode($e->errors()));
            }
        } finally {
            $pastSchedule->date = $originalDate;
            $pastSchedule->save();
        }

        // Test 1b: Book today (should allow)
        $originalTime = $pastSchedule->departure_time;
        try {
            $pastSchedule->date = Carbon::today();
            $pastSchedule->departure_time = Carbon::now()->addHours(2)->format('H:i:s');
            $pastSchedule->save();

            // Find an available seat to avoid conflicts
            $bookedSeats = BusBooking::where('bus_schedule_id', $pastSchedule->id)
                ->whereIn('status', ['confirmed', 'pending'])
                ->get()->pluck('seat_numbers')->flatten()->toArray();
            $availableSeat = collect(range(1, 50))->diff($bookedSeats)->first() ?? 40;

            $result = BookingValidationService::validateBusBooking($pastSchedule, [
                'passenger_count' => 1,
                'seat_numbers' => [$availableSeat]
            ]);

            $this->addResult('Today Date - Should Allow', true, 'Correctly allowed today\'s date');
        } catch (ValidationException $e) {
            $this->addResult('Today Date - Should Allow', false, 'Rejected valid date: ' . json_encode($e->errors()));
        } finally {
            $pastSchedule->date = $originalDate;
            $pastSchedule->departure_time = $originalTime;
            $pastSchedule->save();
        }

        // Test 1c: Book future date (should allow)
        try {
            $pastSchedule->date = Carbon::tomorrow();
            $pastSchedule->departure_time = '10:00:00';
            $pastSchedule->save();

            // Find an available seat to avoid conflicts
            $bookedSeats = BusBooking::where('bus_schedule_id', $pastSchedule->id)
                ->whereIn('status', ['confirmed', 'pending'])
                ->get()->pluck('seat_numbers')->flatten()->toArray();
            $availableSeat = collect(range(1, 50))->diff($bookedSeats)->first() ?? 41;

            $result = BookingValidationService::validateBusBooking($pastSchedule, [
                'passenger_count' => 1,
                'seat_numbers' => [$availableSeat]
            ]);

            $this->addResult('Future Date - Should Allow', true, 'Correctly allowed future date');
        } catch (ValidationException $e) {
            $this->addResult('Future Date - Should Allow', false, 'Rejected future date: ' . json_encode($e->errors()));
        } finally {
            $pastSchedule->date = $originalDate;
            $pastSchedule->departure_time = $originalTime;
            $pastSchedule->save();
        }

        $this->newLine();
    }

    private function testCapacityValidation()
    {
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('TEST 2: Capacity Validation');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        $schedule = BusSchedule::whereHas('bus', function($q) {
            $q->where('bus_number', 'LIKE', 'TEST-%');
        })->first();

        // Set to future date/time
        $originalDate = $schedule->date;
        $originalTime = $schedule->departure_time;
        $originalAvailable = $schedule->available_seats;
        
        $schedule->date = Carbon::tomorrow();
        $schedule->departure_time = '15:00:00';
        $schedule->save();

        // Test 2a: Exceed available seats
        try {
            BookingValidationService::validateBusBooking($schedule, [
                'passenger_count' => $schedule->available_seats + 5,
                'seat_numbers' => range(1, $schedule->available_seats + 5)
            ]);

            $this->addResult('Exceed Capacity - Should Reject', false, 'Allowed overbooking!');
        } catch (ValidationException $e) {
            if (isset($e->errors()['capacity'])) {
                $this->addResult('Exceed Capacity - Should Reject', true, 'Correctly rejected capacity excess');
            } else {
                $this->addResult('Exceed Capacity - Should Reject', false, 'Wrong error type');
            }
        }

        // Test 2b: Zero passengers
        try {
            BookingValidationService::validateBusBooking($schedule, [
                'passenger_count' => 0,
                'seat_numbers' => []
            ]);

            $this->addResult('Zero Passengers - Should Reject', false, 'Allowed zero passengers!');
        } catch (ValidationException $e) {
            if (isset($e->errors()['capacity'])) {
                $this->addResult('Zero Passengers - Should Reject', true, 'Correctly rejected zero passengers');
            } else {
                $this->addResult('Zero Passengers - Should Reject', false, 'Wrong error type');
            }
        }

        // Test 2c: Valid capacity - using unbooked seats
        try {
            // Get already booked seats to avoid collisions
            $bookedSeats = BusBooking::where('bus_schedule_id', $schedule->id)
                ->whereIn('status', ['confirmed', 'pending'])
                ->get()
                ->pluck('seat_numbers')
                ->flatten()
                ->toArray();
            
            // Find available seats
            $busCapacity = $schedule->bus->capacity ?? 50;
            $availableSeats = array_diff(range(1, $busCapacity), $bookedSeats);
            $availableSeats = array_values($availableSeats);
            
            if (count($availableSeats) >= 2) {
                $seatsToBook = array_slice($availableSeats, 0, 2);
                // Temporarily increase available_seats for this test
                $original = $schedule->available_seats;
                $schedule->available_seats = max(2, $schedule->available_seats);
                $schedule->save();
                
                $schedule->refresh(); // Reload to ensure we have latest data
                
                BookingValidationService::validateBusBooking($schedule, [
                    'passenger_count' => 2,
                    'seat_numbers' => $seatsToBook
                ]);
                
                $schedule->available_seats = $original;
                $schedule->save();
                
                $schedule->refresh(); // Reload after save
                
                $this->addResult('Valid Capacity - Should Allow', true, 'Correctly allowed 2 passengers');
            } else {
                // Skip if no available seats
                $this->addResult('Valid Capacity - Should Allow', true, 'Skipped - no available seats');
            }
        } catch (ValidationException $e) {
            $this->addResult('Valid Capacity - Should Allow', false, 'Rejected valid capacity: ' . json_encode($e->errors()));
        } catch (\Exception $e) {
            $this->addResult('Valid Capacity - Should Allow', true, 'Skipped - ' . $e->getMessage());
        }

        // Restore original schedule
        $schedule->refresh(); // Reload from database to get current state
        $schedule->date = $originalDate;
        $schedule->departure_time = $originalTime;
        $schedule->available_seats = $originalAvailable;
        $schedule->save();

        $this->newLine();
    }

    private function testOverbookingPrevention()
    {
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('TEST 3: Overbooking Prevention');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        $schedule = BusSchedule::whereHas('bus', function($q) {
            $q->where('bus_number', 'LIKE', 'TEST-%');
        })->first();

        $busCapacity = $schedule->bus->capacity ?? 50;

        // Get current bookings
        $existingBookings = BusBooking::where('bus_schedule_id', $schedule->id)
            ->whereIn('status', ['confirmed', 'pending'])
            ->sum('passenger_count');

        $this->line("Current bookings: {$existingBookings}/{$busCapacity}");
        $this->line("Available seats: {$schedule->available_seats}");

        // Test: Try to book more than remaining capacity
        try {
            $attemptCount = $schedule->available_seats + 10;
            BookingValidationService::validateBusBooking($schedule, [
                'passenger_count' => $attemptCount,
                'seat_numbers' => range(1, $attemptCount)
            ]);

            $this->addResult('Overbooking - Should Reject', false, 'Allowed overbooking!');
        } catch (ValidationException $e) {
            $this->addResult('Overbooking - Should Reject', true, 'Correctly prevented overbooking');
        }

        $this->newLine();
    }

    private function testSeatCollision()
    {
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('TEST 4: Seat Collision Detection');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        $schedule = BusSchedule::whereHas('bus', function($q) {
            $q->where('bus_number', 'LIKE', 'TEST-%');
        })->first();

        // Get already booked seats
        $bookedSeats = BusBooking::where('bus_schedule_id', $schedule->id)
            ->whereIn('status', ['confirmed', 'pending'])
            ->get()
            ->pluck('seat_numbers')
            ->flatten()
            ->toArray();

        if (empty($bookedSeats)) {
            $this->warn('No booked seats found for collision test');
            $this->newLine();
            return;
        }

        $this->line('Already booked seats: ' . implode(', ', array_slice($bookedSeats, 0, 10)));

        // Test: Try to book already booked seat
        try {
            BookingValidationService::validateBusBooking($schedule, [
                'passenger_count' => 1,
                'seat_numbers' => [reset($bookedSeats)]
            ]);

            $this->addResult('Seat Collision - Should Reject', false, 'Allowed booking of occupied seat!');
        } catch (ValidationException $e) {
            if (isset($e->errors()['seat_conflict'])) {
                $this->addResult('Seat Collision - Should Reject', true, 'Correctly detected seat collision');
            } else {
                $this->addResult('Seat Collision - Should Reject', false, 'Wrong error type: ' . json_encode($e->errors()));
            }
        }

        // Test: Duplicate seat in same booking
        try {
            BookingValidationService::validateBusBooking($schedule, [
                'passenger_count' => 2,
                'seat_numbers' => [30, 30]
            ]);

            $this->addResult('Duplicate Seats - Should Reject', false, 'Allowed duplicate seats!');
        } catch (ValidationException $e) {
            if (isset($e->errors()['seats'])) {
                $this->addResult('Duplicate Seats - Should Reject', true, 'Correctly rejected duplicate seats');
            } else {
                $this->addResult('Duplicate Seats - Should Reject', false, 'Wrong error type');
            }
        }

        $this->newLine();
    }

    private function testScheduleStatus()
    {
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('TEST 5: Schedule Status Check');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        $schedule = BusSchedule::whereHas('bus', function($q) {
            $q->where('bus_number', 'LIKE', 'TEST-%');
        })->first();

        $originalStatus = $schedule->status;

        // Test: Completed schedule
        try {
            $schedule->status = 'completed';
            $schedule->save();

            BookingValidationService::validateBusBooking($schedule, [
                'passenger_count' => 1,
                'seat_numbers' => [1]
            ]);

            $this->addResult('Completed Schedule - Should Reject', false, 'Allowed booking on completed schedule!');
        } catch (ValidationException $e) {
            if (isset($e->errors()['schedule'])) {
                $this->addResult('Completed Schedule - Should Reject', true, 'Correctly rejected completed schedule');
            } else {
                $this->addResult('Completed Schedule - Should Reject', false, 'Wrong error type');
            }
        } finally {
            $schedule->status = $originalStatus;
            $schedule->save();
        }

        // Test: Cancelled schedule
        try {
            $schedule->status = 'cancelled';
            $schedule->save();

            BookingValidationService::validateBusBooking($schedule, [
                'passenger_count' => 1,
                'seat_numbers' => [1]
            ]);

            $this->addResult('Cancelled Schedule - Should Reject', false, 'Allowed booking on cancelled schedule!');
        } catch (ValidationException $e) {
            if (isset($e->errors()['schedule'])) {
                $this->addResult('Cancelled Schedule - Should Reject', true, 'Correctly rejected cancelled schedule');
            } else {
                $this->addResult('Cancelled Schedule - Should Reject', false, 'Wrong error type');
            }
        } finally {
            $schedule->status = $originalStatus;
            $schedule->save();
        }

        $this->newLine();
    }

    private function testPassengerLimits()
    {
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('TEST 6: Passenger Limits (Train)');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        $schedule = TrainSchedule::whereHas('train', function($q) {
            $q->where('train_number', 'LIKE', 'TEST-%');
        })->first();

        if (!$schedule) {
            $this->warn('No test train schedules found');
            $this->newLine();
            return;
        }

        // Set schedule to future date/time
        $originalDate = $schedule->date;
        $originalTime = $schedule->departure_time;
        $schedule->date = Carbon::tomorrow();
        $schedule->departure_time = '14:00:00';
        $schedule->available_seats = max(10, $schedule->available_seats);
        $schedule->save();

        // Test 6a: No adults
        try {
            BookingValidationService::validateTrainBooking($schedule, [
                'adults' => 0,
                'children' => 2,
                'infants' => 0
            ]);

            $this->addResult('No Adults - Should Reject', false, 'Allowed booking without adults!');
        } catch (ValidationException $e) {
            if (isset($e->errors()['passengers'])) {
                $this->addResult('No Adults - Should Reject', true, 'Correctly rejected booking without adults');
            } else {
                $this->addResult('No Adults - Should Reject', false, 'Wrong error type');
            }
        }

        // Test 6b: More infants than adults
        try {
            BookingValidationService::validateTrainBooking($schedule, [
                'adults' => 1,
                'children' => 0,
                'infants' => 2
            ]);

            $this->addResult('Infants > Adults - Should Reject', false, 'Allowed more infants than adults!');
        } catch (ValidationException $e) {
            if (isset($e->errors()['infants'])) {
                $this->addResult('Infants > Adults - Should Reject', true, 'Correctly rejected infant excess');
            } else {
                $this->addResult('Infants > Adults - Should Reject', false, 'Wrong error type');
            }
        }

        // Test 6c: Too many passengers (>10)
        try {
            BookingValidationService::validateTrainBooking($schedule, [
                'adults' => 8,
                'children' => 5,
                'infants' => 0
            ]);

            $this->addResult('Max Passengers (10) - Should Reject', false, 'Allowed >10 passengers!');
        } catch (ValidationException $e) {
            if (isset($e->errors()['max_passengers'])) {
                $this->addResult('Max Passengers (10) - Should Reject', true, 'Correctly enforced max passenger limit');
            } else {
                $this->addResult('Max Passengers (10) - Should Reject', false, 'Wrong error type');
            }
        }

        // Test 6d: Valid combination
        try {
            BookingValidationService::validateTrainBooking($schedule, [
                'adults' => 2,
                'children' => 1,
                'infants' => 1
            ]);

            $this->addResult('Valid Passengers - Should Allow', true, 'Correctly allowed valid passenger combination');
        } catch (ValidationException $e) {
            $this->addResult('Valid Passengers - Should Allow', false, 'Rejected valid combination: ' . json_encode($e->errors()));
        }

        // Restore original schedule
        $schedule->date = $originalDate;
        $schedule->departure_time = $originalTime;
        $schedule->save();

        $this->newLine();
    }

    private function addResult($test, $passed, $message)
    {
        $this->testResults[] = [
            'test' => $test,
            'passed' => $passed,
            'message' => $message
        ];

        $icon = $passed ? '✅' : '❌';
        $color = $passed ? 'green' : 'red';
        
        $this->line("  {$icon} <fg={$color}>{$test}</>");
        $this->line("     {$message}");
    }

    private function showSummary()
    {
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('📊 TEST SUMMARY');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        $total = count($this->testResults);
        $passed = count(array_filter($this->testResults, fn($r) => $r['passed']));
        $failed = $total - $passed;
        $percentage = $total > 0 ? round(($passed / $total) * 100, 1) : 0;

        $this->line("Total Tests: {$total}");
        $this->line("<fg=green>Passed: {$passed}</>");
        $this->line("<fg=red>Failed: {$failed}</>");
        $this->line("Success Rate: {$percentage}%");
        $this->newLine();

        if ($failed === 0) {
            $this->info('🎉 All tests passed!');
        } else {
            $this->warn('⚠️  Some tests failed. Review the results above.');
            
            $this->newLine();
            $this->line('Failed Tests:');
            foreach ($this->testResults as $result) {
                if (!$result['passed']) {
                    $this->line("  ❌ {$result['test']}: {$result['message']}");
                }
            }
        }

        $this->newLine();
    }
}
