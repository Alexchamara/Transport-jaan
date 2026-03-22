<?php

namespace App\Console\Commands;

use App\Models\Courier\VendorCourierSetting;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class PublishScheduledCourierPricing extends Command
{
    protected $signature = 'courier:publish-scheduled-pricing {--dry-run : Run without persisting updates}';

    protected $description = 'Publish scheduled courier pricing snapshots when effective time is reached';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $now = Carbon::now();

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No scheduled pricing publications will be persisted.');
        }

        $processed = 0;
        $published = 0;
        $skipped = 0;

        VendorCourierSetting::query()->orderBy('id')->chunkById(100, function ($records) use (&$processed, &$published, &$skipped, $dryRun, $now) {
            foreach ($records as $record) {
                $processed++;

                $settings = is_array($record->settings) ? $record->settings : [];
                $pricing = is_array($settings['pricing'] ?? null) ? $settings['pricing'] : [];
                $governance = is_array($pricing['governance'] ?? null) ? $pricing['governance'] : [];
                $scheduled = is_array($governance['scheduledPublish'] ?? null) ? $governance['scheduledPublish'] : null;

                if (!$scheduled || !is_array($scheduled['snapshot'] ?? null) || empty($scheduled['effectiveAt'])) {
                    $skipped++;
                    continue;
                }

                $effectiveAt = Carbon::parse((string) $scheduled['effectiveAt']);
                if ($effectiveAt->gt($now)) {
                    $skipped++;
                    continue;
                }

                $snapshot = $scheduled['snapshot'];
                $pricing['localization'] = is_array($snapshot['localization'] ?? null)
                    ? $snapshot['localization']
                    : (is_array($pricing['localization'] ?? null) ? $pricing['localization'] : []);
                $pricing['formula'] = is_array($snapshot['formula'] ?? null)
                    ? $snapshot['formula']
                    : (is_array($pricing['formula'] ?? null) ? $pricing['formula'] : []);
                $pricing['categories'] = is_array($snapshot['categories'] ?? null)
                    ? $snapshot['categories']
                    : (is_array($pricing['categories'] ?? null) ? $pricing['categories'] : []);

                $changeLog = collect($governance['changeLog'] ?? [])
                    ->prepend([
                        'event' => 'scheduled_publish_executed',
                        'at' => $now->toDateTimeString(),
                        'actorUserId' => null,
                        'meta' => [
                            'effectiveAt' => (string) $scheduled['effectiveAt'],
                        ],
                    ])
                    ->take(50)
                    ->values()
                    ->all();

                $governance['publishedVersion'] = max(1, (int) ($governance['publishedVersion'] ?? 1)) + 1;
                $governance['publishedAt'] = $now->toDateTimeString();
                $governance['publishedBy'] = null;
                $governance['scheduledPublish'] = null;
                $governance['pendingApproval'] = null;
                $governance['changeLog'] = $changeLog;

                $pricing['governance'] = $governance;
                $settings['pricing'] = $pricing;

                if (!$dryRun) {
                    $record->update(['settings' => $settings]);
                }

                $published++;
            }
        });

        $this->info("Processed: {$processed}");
        $this->info("Published: {$published}");
        $this->line("Skipped: {$skipped}");

        return self::SUCCESS;
    }
}
