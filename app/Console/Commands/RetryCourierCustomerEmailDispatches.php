<?php

namespace App\Console\Commands;

use App\Jobs\SendCourierCustomerEmailJob;
use App\Models\Courier\CourierCustomerEmailDispatch;
use Illuminate\Console\Command;

class RetryCourierCustomerEmailDispatches extends Command
{
    protected $signature = 'courier:customer-email-retry
        {--limit=100 : Maximum number of failed email dispatches to requeue}';

    protected $description = 'Requeue failed courier customer lifecycle emails';

    public function handle(): int
    {
        $limit = max(1, (int) $this->option('limit'));

        $dispatches = CourierCustomerEmailDispatch::query()
            ->where('channel', 'email')
            ->where('status', CourierCustomerEmailDispatch::STATUS_FAILED)
            ->orderBy('updated_at')
            ->limit($limit)
            ->get();

        if ($dispatches->isEmpty()) {
            $this->info('No failed courier customer email dispatches found.');

            return self::SUCCESS;
        }

        $count = 0;

        foreach ($dispatches as $dispatch) {
            $dispatch->forceFill([
                'status' => CourierCustomerEmailDispatch::STATUS_PENDING,
                'last_error' => null,
                'queued_at' => now(),
            ])->save();

            SendCourierCustomerEmailJob::dispatch((int) $dispatch->id);
            $count++;
        }

        $this->info('Requeued ' . $count . ' courier customer email dispatch(es).');

        return self::SUCCESS;
    }
}
