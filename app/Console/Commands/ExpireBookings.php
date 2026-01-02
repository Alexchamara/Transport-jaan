<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BusBooking;
use App\Models\TrainBooking;
use App\Models\BusSchedule;
use App\Models\TrainSchedule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExpireBookings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bookings:expire {--dry-run : Run without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire unpaid bookings and release their seats';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        
        if ($dryRun) {
            $this->warn('🔍 DRY RUN MODE - No changes will be made');
        }

        $this->info('🕐 Checking for expired bookings...');
        $this->newLine();

        // Expire bus bookings
        $expiredBusCount = $this->expireBusBookings($dryRun);
        
        // Expire train bookings
        $expiredTrainCount = $this->expireTrainBookings($dryRun);

        $this->newLine();
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('📊 Summary');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->line("Bus bookings expired: {$expiredBusCount}");
        $this->line("Train bookings expired: {$expiredTrainCount}");
        $this->line("Total: " . ($expiredBusCount + $expiredTrainCount));
        
        if ($dryRun) {
            $this->newLine();
            $this->comment('Run without --dry-run to actually expire bookings');
        }

        return 0;
    }

    private function expireBusBookings($dryRun = false): int
    {
        $this->line('🚌 Processing bus bookings...');

        $expiredBookings = BusBooking::with(['busSchedule'])
            ->expired()
            ->get();

        if ($expiredBookings->isEmpty()) {
            $this->line('   ✓ No expired bus bookings found');
            return 0;
        }

        $count = 0;

        foreach ($expiredBookings as $booking) {
            try {
                if (!$dryRun) {
                    DB::transaction(function () use ($booking) {
                        // Update booking status
                        $booking->update([
                            'status' => 'cancelled',
                            'payment_status' => 'failed'
                        ]);

                        // Release seats back to schedule
                        $schedule = BusSchedule::lockForUpdate()
                            ->find($booking->bus_schedule_id);
                        
                        if ($schedule) {
                            $schedule->increment('available_seats', $booking->passenger_count);
                        }

                        Log::info('Bus booking expired and seats released', [
                            'booking_id' => $booking->id,
                            'reference' => $booking->booking_reference,
                            'seats_released' => $booking->passenger_count,
                            'seat_numbers' => $booking->seat_numbers
                        ]);
                    });
                }

                $expiredAt = $booking->expires_at->format('Y-m-d H:i:s');
                $this->line("   • {$booking->booking_reference} - Expired at {$expiredAt} - Seats: " . implode(',', $booking->seat_numbers));
                $count++;

            } catch (\Exception $e) {
                $this->error("   ✗ Failed to expire booking {$booking->booking_reference}: {$e->getMessage()}");
                Log::error('Failed to expire bus booking', [
                    'booking_id' => $booking->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        $this->line("   ✓ Expired {$count} bus booking(s)");
        return $count;
    }

    private function expireTrainBookings($dryRun = false): int
    {
        $this->line('🚂 Processing train bookings...');

        $expiredBookings = TrainBooking::with(['trainSchedule'])
            ->expired()
            ->get();

        if ($expiredBookings->isEmpty()) {
            $this->line('   ✓ No expired train bookings found');
            return 0;
        }

        $count = 0;

        foreach ($expiredBookings as $booking) {
            try {
                if (!$dryRun) {
                    DB::transaction(function () use ($booking) {
                        // Update booking status
                        $booking->update([
                            'status' => 'cancelled',
                            'payment_status' => 'failed'
                        ]);

                        // Release seats back to schedule
                        $schedule = TrainSchedule::lockForUpdate()
                            ->find($booking->train_schedule_id);
                        
                        if ($schedule) {
                            $schedule->increment('available_seats', $booking->total_passengers);
                        }

                        Log::info('Train booking expired and seats released', [
                            'booking_id' => $booking->id,
                            'reference' => $booking->booking_reference,
                            'seats_released' => $booking->total_passengers
                        ]);
                    });
                }

                $expiredAt = $booking->expires_at->format('Y-m-d H:i:s');
                $this->line("   • {$booking->booking_reference} - Expired at {$expiredAt} - Passengers: {$booking->total_passengers}");
                $count++;

            } catch (\Exception $e) {
                $this->error("   ✗ Failed to expire booking {$booking->booking_reference}: {$e->getMessage()}");
                Log::error('Failed to expire train booking', [
                    'booking_id' => $booking->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        $this->line("   ✓ Expired {$count} train booking(s)");
        return $count;
    }
}
