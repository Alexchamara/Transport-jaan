<?php

namespace Tests\Feature\Courier;

use App\Models\Courier\CourierVendorCodCapability;
use App\Models\Courier\CourierVendorCodCapabilityAudit;
use App\Models\Courier\CourierVendorCodIntegrityIncident;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CourierCodIntegrityMonitoringCommandTest extends TestCase
{
    use DatabaseTransactions;

    public function test_monitor_command_opens_incident_when_auto_open_is_enabled(): void
    {
        [, $capability] = $this->createCompromisedCapability();

        $this->assertSame(0, CourierVendorCodIntegrityIncident::query()->count());

        $this->artisan('courier:cod-integrity-monitor --auto-open')
            ->assertExitCode(0);

        $incident = CourierVendorCodIntegrityIncident::query()
            ->where('courier_vendor_cod_capability_id', (int) $capability->id)
            ->latest('id')
            ->first();

        $this->assertNotNull($incident);
        $this->assertSame(CourierVendorCodIntegrityIncident::STATUS_OPEN, (string) $incident->status);
        $this->assertGreaterThanOrEqual(1, (int) ($incident->detected_issue_count ?? 0));
        $this->assertSame('cod_integrity_monitor', (string) data_get($incident->metadata, 'source', ''));

        $latestAuditEvent = CourierVendorCodCapabilityAudit::query()
            ->where('courier_vendor_cod_capability_id', (int) $capability->id)
            ->latest('id')
            ->value('event_type');

        $this->assertSame('cod_integrity_incident_opened', (string) $latestAuditEvent);
    }

    public function test_monitor_command_does_not_open_duplicate_incident_when_active_incident_exists(): void
    {
        [$vendor, $capability] = $this->createCompromisedCapability();

        CourierVendorCodIntegrityIncident::query()->create([
            'courier_vendor_cod_capability_id' => (int) $capability->id,
            'vendor_user_id' => (int) $vendor->id,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
            'status' => CourierVendorCodIntegrityIncident::STATUS_OPEN,
            'severity' => CourierVendorCodIntegrityIncident::SEVERITY_HIGH,
            'title' => 'Existing integrity incident',
            'description' => 'Already in progress.',
            'detected_issue_count' => 2,
            'detected_at' => now()->subMinutes(5),
            'metadata' => [
                'source' => 'test_seed',
            ],
        ]);

        $this->artisan('courier:cod-integrity-monitor --auto-open')
            ->assertExitCode(0);

        $this->assertSame(
            1,
            CourierVendorCodIntegrityIncident::query()
                ->where('courier_vendor_cod_capability_id', (int) $capability->id)
                ->count()
        );
    }

    public function test_monitor_command_dry_run_does_not_persist_incident_or_audit_event(): void
    {
        [, $capability] = $this->createCompromisedCapability();

        $this->artisan('courier:cod-integrity-monitor --auto-open --dry-run')
            ->assertExitCode(0);

        $this->assertSame(
            0,
            CourierVendorCodIntegrityIncident::query()
                ->where('courier_vendor_cod_capability_id', (int) $capability->id)
                ->count()
        );

        $this->assertSame(
            0,
            CourierVendorCodCapabilityAudit::query()
                ->where('courier_vendor_cod_capability_id', (int) $capability->id)
                ->where('event_type', 'cod_integrity_incident_opened')
                ->count()
        );
    }

    private function createCompromisedCapability(): array
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
            'requested_at' => now()->subHour(),
            'requested_note' => 'Prepared for COD enablement.',
        ]);

        $submittedAudit = CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_request_submitted',
            CourierVendorCodCapability::STATUS_NOT_REQUESTED,
            CourierVendorCodCapability::STATUS_PENDING,
            $vendor->id,
            'Submitted for approval.',
            [
                'source' => 'test_setup',
            ]
        );

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_approved',
            CourierVendorCodCapability::STATUS_PENDING,
            CourierVendorCodCapability::STATUS_APPROVED,
            $vendor->id,
            'Approved in test setup.',
            [
                'source' => 'test_setup',
                'expires_at' => now()->addMonths(3)->format('Y-m-d H:i:s'),
            ]
        );

        DB::table('courier_vendor_cod_capability_audits')
            ->where('id', (int) $submittedAudit->id)
            ->update([
                'record_hash' => str_repeat('e', 64),
            ]);

        return [$vendor, $capability];
    }
}
