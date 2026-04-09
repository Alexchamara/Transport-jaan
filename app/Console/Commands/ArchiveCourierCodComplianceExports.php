<?php

namespace App\Console\Commands;

use App\Services\Courier\CourierCodComplianceExportService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

class ArchiveCourierCodComplianceExports extends Command
{
    protected $signature = 'courier:cod-compliance-archive
        {--status=all : Filter capabilities by status}
        {--category=all : Filter capabilities by category}
        {--search= : Vendor name/email search filter}
        {--from= : Requested date from (Y-m-d)}
        {--to= : Requested date to (Y-m-d)}
        {--disk= : Storage disk override}
        {--path= : Storage path override}
        {--retention-days= : Override retention period in days for old archive cleanup}
        {--dry-run : Build payload but do not write the archive file}';

    protected $description = 'Generate and archive the daily courier COD compliance export package';

    public function handle(CourierCodComplianceExportService $service): int
    {
        try {
            $filters = $this->resolveFilters();
            $retentionDays = $this->resolveRetentionDays();
        } catch (InvalidArgumentException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $package = $service->buildPackage($filters, null);
        $jsonPayload = $service->encodePackage($package);

        $disk = trim((string) ($this->option('disk') ?: config('courier.cod_compliance_export.archive.disk', 'local')));
        $path = trim((string) ($this->option('path') ?: config('courier.cod_compliance_export.archive.path', 'courier/cod-compliance')), '/');
        $fileName = $service->buildFileName();
        $targetPath = $path !== '' ? ($path . '/' . $fileName) : $fileName;

        if ((bool) $this->option('dry-run')) {
            $this->info('Dry run completed. Compliance package was built but not archived.');
            $this->table(
                ['Metric', 'Value'],
                [
                    ['Capabilities', (string) ((int) data_get($package, 'manifest.counts.capabilities', 0))],
                    ['Audit events', (string) ((int) data_get($package, 'manifest.counts.audits', 0))],
                    ['Incidents', (string) ((int) data_get($package, 'manifest.counts.incidents', 0))],
                    ['Active incidents', (string) ((int) data_get($package, 'manifest.counts.activeIncidents', 0))],
                    ['Retention days', (string) $retentionDays],
                    ['Target disk', $disk],
                    ['Target path', $targetPath],
                ]
            );

            return self::SUCCESS;
        }

        $stored = Storage::disk($disk)->put($targetPath, $jsonPayload);

        if (!$stored) {
            $this->error('Failed to write COD compliance archive package.');

            return self::FAILURE;
        }

        $purgedArchives = $this->purgeExpiredArchives($disk, $path, $retentionDays);

        Log::info('COURIER COD COMPLIANCE PACKAGE ARCHIVED', [
            'disk' => $disk,
            'path' => $targetPath,
            'retention_days' => $retentionDays,
            'purged_archives' => $purgedArchives,
            'counts' => data_get($package, 'manifest.counts', []),
            'filters' => data_get($package, 'manifest.filters', []),
        ]);

        $this->info('Courier COD compliance package archived successfully.');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Capabilities', (string) ((int) data_get($package, 'manifest.counts.capabilities', 0))],
                ['Audit events', (string) ((int) data_get($package, 'manifest.counts.audits', 0))],
                ['Incidents', (string) ((int) data_get($package, 'manifest.counts.incidents', 0))],
                ['Active incidents', (string) ((int) data_get($package, 'manifest.counts.activeIncidents', 0))],
                ['Purged archives', (string) $purgedArchives],
                ['Retention days', (string) $retentionDays],
                ['Stored on disk', $disk],
                ['Stored path', $targetPath],
            ]
        );

        return self::SUCCESS;
    }

    private function resolveFilters(): array
    {
        $status = strtolower(trim((string) $this->option('status')));
        if (!in_array($status, CourierCodComplianceExportService::STATUSES, true)) {
            throw new InvalidArgumentException('Invalid --status option. Allowed values: all, pending, approved, rejected, not_requested.');
        }

        $category = strtolower(trim((string) $this->option('category')));
        if (!in_array($category, CourierCodComplianceExportService::CATEGORIES, true)) {
            throw new InvalidArgumentException('Invalid --category option. Allowed values: all, domestic, international, logistic.');
        }

        $search = trim((string) $this->option('search'));

        $from = $this->resolveDateOption((string) $this->option('from'), true, '--from');
        $to = $this->resolveDateOption((string) $this->option('to'), false, '--to');

        if ($from instanceof Carbon && $to instanceof Carbon && $to->lt($from)) {
            throw new InvalidArgumentException('Invalid date range: --to must be after or equal to --from.');
        }

        return [
            'status' => $status,
            'category' => $category,
            'search' => $search,
            'from' => $from,
            'to' => $to,
        ];
    }

    private function resolveDateOption(string $rawValue, bool $isStart, string $optionName): ?Carbon
    {
        $value = trim($rawValue);
        if ($value === '') {
            return null;
        }

        try {
            $date = Carbon::parse($value);
        } catch (\Throwable $exception) {
            throw new InvalidArgumentException('Invalid ' . $optionName . ' date value. Use format Y-m-d or a parseable date/time.');
        }

        return $isStart ? $date->startOfDay() : $date->endOfDay();
    }

    private function resolveRetentionDays(): int
    {
        $raw = $this->option('retention-days');

        if ($raw !== null && trim((string) $raw) !== '') {
            if (!is_numeric($raw)) {
                throw new InvalidArgumentException('Invalid --retention-days value. Provide a non-negative integer.');
            }

            $days = (int) $raw;
        } else {
            $days = (int) config('courier.cod_compliance_export.archive.retention_days', 90);
        }

        if ($days < 0) {
            throw new InvalidArgumentException('Invalid retention period. retention_days must be greater than or equal to zero.');
        }

        return $days;
    }

    private function purgeExpiredArchives(string $disk, string $path, int $retentionDays): int
    {
        if ($retentionDays <= 0) {
            return 0;
        }

        $cutoff = now()->subDays($retentionDays);
        $files = $path !== ''
            ? Storage::disk($disk)->files($path)
            : Storage::disk($disk)->files();

        $purged = 0;

        foreach ($files as $file) {
            $timestamp = $this->archiveTimestampFromFileName(basename((string) $file));
            if (!$timestamp instanceof Carbon) {
                continue;
            }

            if ($timestamp->lt($cutoff) && Storage::disk($disk)->delete($file)) {
                $purged++;
            }
        }

        return $purged;
    }

    private function archiveTimestampFromFileName(string $fileName): ?Carbon
    {
        if (!preg_match('/^courier_cod_compliance_package_(\d{8})_(\d{6})\.json$/', $fileName, $matches)) {
            return null;
        }

        try {
            return Carbon::createFromFormat('Ymd_His', $matches[1] . '_' . $matches[2]);
        } catch (\Throwable $exception) {
            return null;
        }
    }
}
