<?php

namespace Tests\Feature\Courier;

use App\Models\Courier\CourierVendorCodCapability;
use App\Models\Courier\CourierVendorCodCapabilityAudit;
use App\Models\Courier\CourierVendorCodIntegrityIncident;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CourierCodComplianceArchiveCommandTest extends TestCase
{
    use DatabaseTransactions;

    public function test_archive_command_writes_compliance_package_to_configured_disk(): void
    {
        [, $capability] = $this->createCapabilityWithAuditAndIncident();

        Storage::fake('local');
        config()->set('courier.cod_compliance_export.archive.disk', 'local');
        config()->set('courier.cod_compliance_export.archive.path', 'tests/cod-compliance');

        $this->artisan('courier:cod-compliance-archive --status=pending --category=domestic')
            ->assertExitCode(0);

        $files = Storage::disk('local')->allFiles('tests/cod-compliance');
        $this->assertCount(1, $files);

        $payload = json_decode((string) Storage::disk('local')->get($files[0]), true);

        $this->assertIsArray($payload);
        $this->assertSame('courier_cod_compliance_export', (string) data_get($payload, 'manifest.package'));
        $this->assertSame(1, (int) data_get($payload, 'manifest.counts.capabilities', 0));
        $this->assertSame(1, (int) data_get($payload, 'manifest.counts.audits', 0));
        $this->assertSame(1, (int) data_get($payload, 'manifest.counts.incidents', 0));
        $this->assertSame(1, (int) data_get($payload, 'manifest.counts.activeIncidents', 0));
        $this->assertSame((int) $capability->id, (int) data_get($payload, 'capabilities.0.capabilityId'));
        $this->assertSame(CourierVendorCodCapability::STATUS_PENDING, (string) data_get($payload, 'capabilities.0.status'));
    }

    public function test_archive_command_dry_run_does_not_persist_file(): void
    {
        $this->createCapabilityWithAuditAndIncident();

        Storage::fake('local');
        config()->set('courier.cod_compliance_export.archive.disk', 'local');
        config()->set('courier.cod_compliance_export.archive.path', 'tests/cod-compliance');

        $this->artisan('courier:cod-compliance-archive --status=pending --category=domestic --dry-run')
            ->assertExitCode(0);

        $files = Storage::disk('local')->allFiles('tests/cod-compliance');
        $this->assertCount(0, $files);
    }

    public function test_archive_command_purges_old_exports_using_retention_policy(): void
    {
        $this->createCapabilityWithAuditAndIncident();

        Storage::fake('local');
        config()->set('courier.cod_compliance_export.archive.disk', 'local');
        config()->set('courier.cod_compliance_export.archive.path', 'tests/cod-compliance');
        config()->set('courier.cod_compliance_export.archive.retention_days', 7);

        $oldFile = 'tests/cod-compliance/courier_cod_compliance_package_' . now()->subDays(25)->format('Ymd_His') . '.json';
        $recentFile = 'tests/cod-compliance/courier_cod_compliance_package_' . now()->subDays(3)->format('Ymd_His') . '.json';

        Storage::disk('local')->put($oldFile, '{"seed":"old"}');
        Storage::disk('local')->put($recentFile, '{"seed":"recent"}');

        $this->artisan('courier:cod-compliance-archive --status=pending --category=domestic')
            ->assertExitCode(0);

        Storage::disk('local')->assertMissing($oldFile);
        Storage::disk('local')->assertExists($recentFile);

        $files = Storage::disk('local')->allFiles('tests/cod-compliance');
        $this->assertCount(2, $files);
    }

    private function createCapabilityWithAuditAndIncident(): array
    {
        $vendor = User::factory()->create([
            'role' => 'vendor',
            'status' => 'verified',
        ]);

        $capability = CourierVendorCodCapability::query()->create([
            'vendor_user_id' => $vendor->id,
            'service_workspace_id' => null,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
            'requested_by_user_id' => $vendor->id,
            'status' => CourierVendorCodCapability::STATUS_PENDING,
            'requested_at' => now()->subMinutes(30),
            'requested_note' => 'Archive command test capability.',
        ]);

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_request_submitted',
            CourierVendorCodCapability::STATUS_NOT_REQUESTED,
            CourierVendorCodCapability::STATUS_PENDING,
            $vendor->id,
            'Submitted from archive command test.',
            [
                'source' => 'test_setup',
            ]
        );

        CourierVendorCodIntegrityIncident::query()->create([
            'courier_vendor_cod_capability_id' => (int) $capability->id,
            'vendor_user_id' => (int) $vendor->id,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
            'status' => CourierVendorCodIntegrityIncident::STATUS_OPEN,
            'severity' => CourierVendorCodIntegrityIncident::SEVERITY_HIGH,
            'title' => 'Archive sample incident',
            'description' => 'Created for command archive assertions.',
            'detected_issue_count' => 1,
            'detected_at' => now()->subMinutes(10),
            'created_by_user_id' => null,
            'metadata' => [
                'source' => 'test_setup',
            ],
        ]);

        return [$vendor, $capability];
    }
}
