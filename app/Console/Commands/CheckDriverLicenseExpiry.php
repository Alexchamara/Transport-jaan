<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Driver;
use Illuminate\Support\Facades\Log;

class CheckDriverLicenseExpiry extends Command
{
    protected $signature = 'drivers:check-license-expiry {--dry-run : Run without making changes}';

    protected $description = 'Mark drivers with expired licenses as Inactive and suspend their linked user accounts';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->warn('DRY RUN MODE — No changes will be made');
        }

        $this->info('Scanning for expired driver licenses…');

        // Only deactivate Active drivers whose license_expiry has passed.
        // Drivers with a pending_review (vendor already uploaded a new license) are
        // still deactivated here because the NEW expiry has NOT been applied yet
        // (it sits in pending_license_expiry until the admin approves).
        $expired = Driver::with('user')
            ->whereNotNull('license_expiry')
            ->whereDate('license_expiry', '<', today())
            ->where('status', 'Active')
            ->get();

        if ($expired->isEmpty()) {
            $this->info('No drivers to deactivate.');
            return 0;
        }

        $count = 0;

        foreach ($expired as $driver) {
            $expiryStr = $driver->license_expiry->format('Y-m-d');
            $this->line("  → {$driver->full_name} (license expired {$expiryStr})");

            if (!$dryRun) {
                $driver->update(['status' => 'Inactive']);

                Log::info(
                    "drivers:check-license-expiry: deactivated driver #{$driver->id} " .
                    "({$driver->full_name}), license expired {$expiryStr}"
                );
            }

            $count++;
        }

        $this->info($dryRun
            ? "Would deactivate {$count} driver(s)."
            : "Deactivated {$count} driver(s)."
        );

        return 0;
    }
}
