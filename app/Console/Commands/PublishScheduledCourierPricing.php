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
                $governanceInput = is_array($pricing['governance'] ?? null) ? $pricing['governance'] : [];
                $hasCategoryGovernance = is_array($governanceInput['domestic'] ?? null) || is_array($governanceInput['logistic'] ?? null);
                $governanceByCategory = $hasCategoryGovernance
                    ? $governanceInput
                    : [
                        'domestic' => $governanceInput,
                        'logistic' => $governanceInput,
                    ];

                $publishedInRecord = false;

                foreach (['domestic', 'logistic'] as $category) {
                    $governance = is_array($governanceByCategory[$category] ?? null) ? $governanceByCategory[$category] : [];
                    $scheduled = is_array($governance['scheduledPublish'] ?? null) ? $governance['scheduledPublish'] : null;

                    if (!$scheduled || !is_array($scheduled['snapshot'] ?? null) || empty($scheduled['effectiveAt'])) {
                        continue;
                    }

                    $effectiveAt = Carbon::parse((string) $scheduled['effectiveAt']);
                    if ($effectiveAt->gt($now)) {
                        continue;
                    }

                    $snapshot = $scheduled['snapshot'];
                    $snapshotCategory = in_array((string) ($snapshot['category'] ?? ''), ['domestic', 'logistic'], true)
                        ? (string) $snapshot['category']
                        : null;

                    if ($snapshotCategory) {
                        $pricing['localization'] = is_array($pricing['localization'] ?? null) ? $pricing['localization'] : [];
                        $pricing['formula'] = is_array($pricing['formula'] ?? null) ? $pricing['formula'] : [];
                        $pricing['serviceCatalog'] = is_array($pricing['serviceCatalog'] ?? null) ? $pricing['serviceCatalog'] : [];
                        $pricing['zoneMaster'] = is_array($pricing['zoneMaster'] ?? null) ? $pricing['zoneMaster'] : [];
                        $pricing['laneMatrix'] = is_array($pricing['laneMatrix'] ?? null) ? $pricing['laneMatrix'] : [];
                        $pricing['categories'] = is_array($pricing['categories'] ?? null) ? $pricing['categories'] : [];

                        $pricing['localization'][$snapshotCategory] = is_array($snapshot['localization'] ?? null)
                            ? $snapshot['localization']
                            : ($pricing['localization'][$snapshotCategory] ?? []);
                        $pricing['formula'][$snapshotCategory] = is_array($snapshot['formula'] ?? null)
                            ? $snapshot['formula']
                            : ($pricing['formula'][$snapshotCategory] ?? []);
                        $pricing['serviceCatalog'][$snapshotCategory] = is_array($snapshot['serviceCatalog'] ?? null)
                            ? $snapshot['serviceCatalog']
                            : ($pricing['serviceCatalog'][$snapshotCategory] ?? []);
                        $pricing['zoneMaster'][$snapshotCategory] = is_array($snapshot['zoneMaster'] ?? null)
                            ? $snapshot['zoneMaster']
                            : ($pricing['zoneMaster'][$snapshotCategory] ?? []);

                        $enabled = $pricing['laneMatrix']['enabled'] ?? false;
                        if (!is_array($enabled)) {
                            $enabled = [
                                'domestic' => (bool) $enabled,
                                'logistic' => (bool) $enabled,
                            ];
                        }
                        $enabled[$snapshotCategory] = (bool) ($snapshot['laneMatrix']['enabled'] ?? false);
                        $pricing['laneMatrix']['enabled'] = $enabled;
                        $pricing['laneMatrix'][$snapshotCategory] = is_array($snapshot['laneMatrix']['rows'] ?? null)
                            ? $snapshot['laneMatrix']['rows']
                            : ($pricing['laneMatrix'][$snapshotCategory] ?? []);

                        $pricing['categories'][$snapshotCategory] = is_array($snapshot['categories'] ?? null)
                            ? $snapshot['categories']
                            : ($pricing['categories'][$snapshotCategory] ?? []);
                    } else {
                        $pricing['localization'] = is_array($snapshot['localization'] ?? null)
                            ? $snapshot['localization']
                            : (is_array($pricing['localization'] ?? null) ? $pricing['localization'] : []);
                        $pricing['formula'] = is_array($snapshot['formula'] ?? null)
                            ? $snapshot['formula']
                            : (is_array($pricing['formula'] ?? null) ? $pricing['formula'] : []);
                        $pricing['serviceCatalog'] = is_array($snapshot['serviceCatalog'] ?? null)
                            ? $snapshot['serviceCatalog']
                            : (is_array($pricing['serviceCatalog'] ?? null) ? $pricing['serviceCatalog'] : []);
                        $pricing['zoneMaster'] = is_array($snapshot['zoneMaster'] ?? null)
                            ? $snapshot['zoneMaster']
                            : (is_array($pricing['zoneMaster'] ?? null) ? $pricing['zoneMaster'] : []);
                        $pricing['laneMatrix'] = is_array($snapshot['laneMatrix'] ?? null)
                            ? $snapshot['laneMatrix']
                            : (is_array($pricing['laneMatrix'] ?? null) ? $pricing['laneMatrix'] : []);
                        $pricing['categories'] = is_array($snapshot['categories'] ?? null)
                            ? $snapshot['categories']
                            : (is_array($pricing['categories'] ?? null) ? $pricing['categories'] : []);
                    }

                    $governance['changeLog'] = collect($governance['changeLog'] ?? [])
                        ->prepend([
                            'event' => 'scheduled_publish_executed',
                            'at' => $now->toDateTimeString(),
                            'actorUserId' => null,
                            'meta' => [
                                'effectiveAt' => (string) $scheduled['effectiveAt'],
                                'category' => $snapshotCategory ?: $category,
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

                    $governanceByCategory[$category] = $governance;
                    $publishedInRecord = true;
                    $published++;
                }

                if (!$publishedInRecord) {
                    $skipped++;
                    continue;
                }

                $pricing['governance'] = $governanceByCategory;
                $settings['pricing'] = $pricing;

                if (!$dryRun) {
                    $record->update(['settings' => $settings]);
                }
            }
        });

        $this->info("Processed: {$processed}");
        $this->info("Published: {$published}");
        $this->line("Skipped: {$skipped}");

        return self::SUCCESS;
    }
}
