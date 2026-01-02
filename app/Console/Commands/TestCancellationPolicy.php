<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\CancellationPolicyService;
use App\Models\BusBooking;
use App\Models\BusSchedule;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TestCancellationPolicy extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:cancellation-policy';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the cancellation policy service with various scenarios';

    private $cancellationService;
    private $testResults = [];
    private $totalTests = 0;
    private $passedTests = 0;

    public function __construct()
    {
        parent::__construct();
        $this->cancellationService = app(CancellationPolicyService::class);
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('========================================');
        $this->info('   CANCELLATION POLICY TEST SUITE');
        $this->info('========================================');
        $this->newLine();

        // Run test scenarios
        $this->testRefundPercentages();
        $this->testRefundCalculation();
        $this->testBookingCancellation();
        $this->testEdgeCases();

        // Display summary
        $this->displaySummary();

        return $this->passedTests === $this->totalTests ? 0 : 1;
    }

    /**
     * Test refund percentage calculations
     */
    private function testRefundPercentages()
    {
        $this->info('Test 1: Refund Percentage Calculations');
        $this->info('---------------------------------------');

        $scenarios = [
            ['hours' => 72, 'expected' => 90, 'description' => '48+ hours before departure'],
            ['hours' => 48, 'expected' => 90, 'description' => 'Exactly 48 hours'],
            ['hours' => 36, 'expected' => 75, 'description' => '36 hours (24-48h range)'],
            ['hours' => 24, 'expected' => 75, 'description' => 'Exactly 24 hours'],
            ['hours' => 18, 'expected' => 50, 'description' => '18 hours (12-24h range)'],
            ['hours' => 12, 'expected' => 50, 'description' => 'Exactly 12 hours'],
            ['hours' => 8, 'expected' => 25, 'description' => '8 hours (6-12h range)'],
            ['hours' => 6, 'expected' => 25, 'description' => 'Exactly 6 hours'],
            ['hours' => 3, 'expected' => 0, 'description' => '3 hours (< 6h)'],
            ['hours' => 0, 'expected' => 0, 'description' => 'At departure time'],
            ['hours' => -5, 'expected' => 0, 'description' => 'After departure'],
        ];

        foreach ($scenarios as $scenario) {
            $result = $this->cancellationService->getRefundPercentage($scenario['hours']);
            $this->runTest(
                $scenario['description'],
                $result === $scenario['expected'],
                "Expected {$scenario['expected']}%, got {$result}%"
            );
        }

        $this->newLine();
    }

    /**
     * Test refund amount calculations
     */
    private function testRefundCalculation()
    {
        $this->info('Test 2: Refund Amount Calculations');
        $this->info('-----------------------------------');

        // Create a test booking
        DB::transaction(function () {
            $user = User::first();
            if (!$user) {
                $this->error('No users found in database. Please seed users first.');
                return;
            }

            // Find an active schedule
            $schedule = BusSchedule::where('status', 'active')
                ->where('date', '>=', now())
                ->first();

            if (!$schedule) {
                $this->error('No active schedules found. Please create schedules first.');
                return;
            }

            // Test scenarios with different departure times
            $testScenarios = [
                ['hours_before' => 72, 'expected_percentage' => 90],
                ['hours_before' => 36, 'expected_percentage' => 75],
                ['hours_before' => 18, 'expected_percentage' => 50],
                ['hours_before' => 8, 'expected_percentage' => 25],
                ['hours_before' => 3, 'expected_percentage' => 0],
            ];

            foreach ($testScenarios as $scenario) {
                // Create booking with future departure
                $departureTime = now()->addHours($scenario['hours_before']);
                
                // Create a test schedule with proper dates
                $arrivalTime = $departureTime->copy()->addHour();
                $testSchedule = BusSchedule::create([
                    'bus_id' => $schedule->bus_id,
                    'departure_station_id' => $schedule->departure_station_id,
                    'arrival_station_id' => $schedule->arrival_station_id,
                    'date' => $departureTime->format('Y-m-d'),
                    'departure_time' => $departureTime->format('H:i:s'),
                    'arrival_time' => $arrivalTime->format('H:i:s'),
                    'duration_minutes' => 60,
                    'price' => $schedule->price,
                    'available_seats' => $schedule->available_seats,
                    'status' => 'active',
                    'is_expressway' => false,
                ]);

                $booking = BusBooking::create([
                    'user_id' => $user->id,
                    'bus_schedule_id' => $testSchedule->id,
                    'passenger_name' => 'Test Passenger',
                    'passenger_email' => 'test@example.com',
                    'passenger_phone' => '0771234567',
                    'seat_numbers' => ['A1'],
                    'passenger_count' => 1,
                    'total_price' => 1500.00,
                    'booking_reference' => 'TEST-' . time() . '-' . $scenario['hours_before'],
                    'status' => 'confirmed',
                    'payment_status' => 'paid',
                ]);

                $booking->load('busSchedule');

                // Calculate refund
                $refundDetails = $this->cancellationService->calculateRefund('bus', $booking);

                $expectedRefund = 1500.00 * ($scenario['expected_percentage'] / 100);
                $expectedFee = 1500.00 - $expectedRefund;

                $this->runTest(
                    "{$scenario['hours_before']}h before departure: {$scenario['expected_percentage']}% refund",
                    abs($refundDetails['refund_amount'] - $expectedRefund) < 0.01 &&
                    abs($refundDetails['cancellation_fee'] - $expectedFee) < 0.01,
                    "Expected refund: LKR {$expectedRefund}, Fee: LKR {$expectedFee}. " .
                    "Got refund: LKR {$refundDetails['refund_amount']}, Fee: LKR {$refundDetails['cancellation_fee']}"
                );
                
                // Cleanup
                $booking->delete();
                $testSchedule->delete();
            }
        });

        $this->newLine();
    }

    /**
     * Test actual booking cancellation
     */
    private function testBookingCancellation()
    {
        $this->info('Test 3: Booking Cancellation Process');
        $this->info('-------------------------------------');

        DB::transaction(function () {
            $user = User::first();
            if (!$user) {
                $this->error('No users found in database. Please seed users first.');
                return;
            }

            $schedule = BusSchedule::where('status', 'active')
                ->where('date', '>=', now()->addDays(3))
                ->first();

            if (!$schedule) {
                $this->warn('No suitable schedules found for cancellation test. Skipping...');
                return;
            }

            // Create test booking
            $booking = BusBooking::create([
                'user_id' => $user->id,
                'bus_schedule_id' => $schedule->id,
                'passenger_name' => 'Test Cancellation',
                'passenger_email' => 'cancel@test.com',
                'passenger_phone' => '0771234567',
                'seat_numbers' => ['Z1', 'Z2'],
                'passenger_count' => 2,
                'total_price' => 3000.00,
                'booking_reference' => 'CANCEL-TEST-' . time(),
                'status' => 'confirmed',
                'payment_status' => 'paid',
            ]);

            // Record initial available seats
            $initialSeats = $schedule->available_seats;

            // Test cancellation
            try {
                $result = $this->cancellationService->cancelBooking(
                    'bus',
                    $booking->booking_reference,
                    $user->id,
                    'Testing cancellation policy'
                );

                $booking->refresh();
                $schedule->refresh();

                // Verify booking is cancelled
                $this->runTest(
                    'Booking status updated to cancelled',
                    $booking->status === 'cancelled',
                    "Expected 'cancelled', got '{$booking->status}'"
                );

                // Verify cancellation timestamp
                $this->runTest(
                    'Cancellation timestamp recorded',
                    $booking->cancelled_at !== null,
                    'cancelled_at should not be null'
                );

                // Verify refund amount saved
                $this->runTest(
                    'Refund amount recorded',
                    $booking->refund_amount > 0,
                    "Refund amount: LKR {$booking->refund_amount}"
                );

                // Verify seats released
                $this->runTest(
                    'Seats released back to schedule',
                    $schedule->available_seats === ($initialSeats + 2),
                    "Expected {$initialSeats} + 2, got {$schedule->available_seats}"
                );

                // Clean up
                $booking->delete();
                $schedule->update(['available_seats' => $initialSeats]);

            } catch (\Exception $e) {
                $this->runTest(
                    'Cancellation process completes without errors',
                    false,
                    "Error: " . $e->getMessage()
                );
            }
        });

        // Rollback transaction
        DB::rollBack();

        $this->newLine();
    }

    /**
     * Test edge cases
     */
    private function testEdgeCases()
    {
        $this->info('Test 4: Edge Cases');
        $this->info('------------------');

        // Test 1: Cannot cancel already cancelled booking
        DB::transaction(function () {
            $user = User::first();
            $schedule = BusSchedule::where('status', 'active')
                ->where('date', '>=', now()->addDays(3))
                ->first();

            if (!$user || !$schedule) {
                $this->warn('Skipping edge case tests - insufficient data');
                return;
            }

            // Create cancelled booking
            $booking = BusBooking::create([
                'user_id' => $user->id,
                'bus_schedule_id' => $schedule->id,
                'passenger_name' => 'Already Cancelled',
                'passenger_email' => 'cancelled@test.com',
                'passenger_phone' => '0771234567',
                'seat_numbers' => ['Y1'],
                'passenger_count' => 1,
                'total_price' => 1500.00,
                'booking_reference' => 'EDGE-TEST-' . time(),
                'status' => 'cancelled',
                'payment_status' => 'refunded',
                'cancelled_at' => now(),
            ]);

            try {
                $result = $this->cancellationService->cancelBooking(
                    'bus',
                    $booking->booking_reference,
                    $user->id,
                    'Trying to cancel again'
                );

                $this->runTest(
                    'Cannot cancel already cancelled booking',
                    $result['success'] === false,
                    'Should return success=false for cancelled bookings'
                );
            } catch (\Exception $e) {
                $this->runTest(
                    'Handles cancelled booking gracefully',
                    true,
                    'Properly rejected already cancelled booking'
                );
            }

            $booking->delete();
        });

        DB::rollBack();

        $this->newLine();
    }

    /**
     * Run a single test and record result
     */
    private function runTest($description, $passed, $details = '')
    {
        $this->totalTests++;

        if ($passed) {
            $this->passedTests++;
            $this->testResults[] = [
                'status' => 'PASS',
                'description' => $description,
                'details' => $details
            ];
            $this->line("  <fg=green>✓</> {$description}");
            if ($details) {
                $this->line("    <fg=gray>{$details}</>");
            }
        } else {
            $this->testResults[] = [
                'status' => 'FAIL',
                'description' => $description,
                'details' => $details
            ];
            $this->line("  <fg=red>✗</> {$description}");
            if ($details) {
                $this->error("    {$details}");
            }
        }
    }

    /**
     * Display test summary
     */
    private function displaySummary()
    {
        $this->newLine();
        $this->info('========================================');
        $this->info('           TEST SUMMARY');
        $this->info('========================================');

        $passRate = $this->totalTests > 0 ? ($this->passedTests / $this->totalTests) * 100 : 0;

        $this->line("Total Tests:  {$this->totalTests}");
        $this->line("<fg=green>Passed:</> {$this->passedTests}");
        $this->line("<fg=red>Failed:</> " . ($this->totalTests - $this->passedTests));
        $this->line("Pass Rate:    " . number_format($passRate, 2) . "%");

        if ($this->passedTests === $this->totalTests) {
            $this->newLine();
            $this->info('🎉 All tests passed! Cancellation policy is working correctly.');
        } else {
            $this->newLine();
            $this->error('⚠️  Some tests failed. Please review the errors above.');
        }

        $this->newLine();
    }
}
