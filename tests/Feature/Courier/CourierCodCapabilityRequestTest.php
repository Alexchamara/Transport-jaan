<?php

namespace Tests\Feature\Courier;

use App\Models\Courier\CourierVendorCodCapabilityAudit;
use App\Models\Courier\CourierVendorCodCapability;
use App\Models\Courier\CourierVendorCodIntegrityIncident;
use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;
use App\Models\ServiceWorkspace;
use App\Models\User;
use App\Models\VendorServiceRegistration;
use App\Models\VendorUserMembership;
use Database\Seeders\CourierRbacSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Inertia\Testing\AssertableInertia as Assert;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class CourierCodCapabilityRequestTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        $this->seed(CourierRbacSeeder::class);
    }

    public function test_vendor_staff_can_submit_cod_capability_request(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership(
            $vendor,
            $workspace,
            ['courier.settings.update'],
            'courier_dispatcher'
        );

        $csrfToken = 'cod-request-test-token';

        $response = $this->actingAs($actor)
            ->withSession(['_token' => $csrfToken])
            ->post(route('courierService.settings.services.cod.request'), [
                '_token' => $csrfToken,
                'note' => 'COD SOP and reconciliation controls are ready.',
            ]);

        $response->assertOk();
        $response->assertJsonFragment([
            'status' => CourierVendorCodCapability::STATUS_PENDING,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
        ]);

        $capability = CourierVendorCodCapability::query()
            ->where('vendor_user_id', $vendor->id)
            ->where('category', CourierVendorCodCapability::CATEGORY_DOMESTIC)
            ->first();

        $this->assertNotNull($capability);
        $this->assertSame(CourierVendorCodCapability::STATUS_PENDING, $capability->status);
        $this->assertSame(CourierVendorCodCapability::CATEGORY_DOMESTIC, (string) $capability->category);
        $this->assertSame($actor->id, (int) $capability->requested_by_user_id);
        $this->assertNotNull($capability->requested_at);

        $audit = CourierVendorCodCapabilityAudit::query()
            ->where('courier_vendor_cod_capability_id', (int) $capability->id)
            ->latest('id')
            ->first();

        $this->assertNotNull($audit);
        $this->assertSame('cod_capability_request_submitted', (string) $audit->event_type);
        $this->assertSame(CourierVendorCodCapability::STATUS_NOT_REQUESTED, (string) ($audit->from_status ?? ''));
        $this->assertSame(CourierVendorCodCapability::STATUS_PENDING, (string) ($audit->to_status ?? ''));
    }

    public function test_superadmin_can_approve_pending_cod_request(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $capability = CourierVendorCodCapability::query()->create([
            'vendor_user_id' => $vendor->id,
            'service_workspace_id' => $workspace->id,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
            'requested_by_user_id' => $vendor->id,
            'status' => CourierVendorCodCapability::STATUS_PENDING,
            'requested_at' => now()->subHour(),
            'requested_note' => 'Ready for COD rollout.',
        ]);

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
            'status' => 'verified',
        ]);

        $csrfToken = 'cod-approve-test-token';

        $response = $this->actingAs($superAdmin)
            ->withSession(['_token' => $csrfToken])
            ->post(route('superadmin.settings.cod-settlement.capabilities.approve', ['capability' => $capability->id]), [
                '_token' => $csrfToken,
                'note' => 'Approved after readiness review.',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $capability->refresh();

        $this->assertSame(CourierVendorCodCapability::STATUS_APPROVED, $capability->status);
        $this->assertSame($superAdmin->id, (int) $capability->reviewed_by_user_id);
        $this->assertNotNull($capability->reviewed_at);
        $this->assertNotNull($capability->approved_at);
        $this->assertNotNull($capability->expires_at);
        $this->assertTrue($capability->expires_at->isFuture());
        $this->assertSame('Approved after readiness review.', $capability->decision_reason);

        $audit = CourierVendorCodCapabilityAudit::query()
            ->where('courier_vendor_cod_capability_id', (int) $capability->id)
            ->latest('id')
            ->first();

        $this->assertNotNull($audit);
        $this->assertSame('cod_capability_approved', (string) $audit->event_type);
        $this->assertSame(CourierVendorCodCapability::STATUS_PENDING, (string) ($audit->from_status ?? ''));
        $this->assertSame(CourierVendorCodCapability::STATUS_APPROVED, (string) ($audit->to_status ?? ''));
    }

    public function test_superadmin_can_approve_pending_cod_request_with_custom_expiry(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $capability = CourierVendorCodCapability::query()->create([
            'vendor_user_id' => $vendor->id,
            'service_workspace_id' => $workspace->id,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
            'requested_by_user_id' => $vendor->id,
            'status' => CourierVendorCodCapability::STATUS_PENDING,
            'requested_at' => now()->subHour(),
            'requested_note' => 'Pending COD capability for route expansion.',
        ]);

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
            'status' => 'verified',
        ]);

        $customExpiry = now()->addDays(90)->setTime(10, 30, 0);
        $csrfToken = 'cod-approve-custom-expiry-token';

        $response = $this->actingAs($superAdmin)
            ->withSession(['_token' => $csrfToken])
            ->post(route('superadmin.settings.cod-settlement.capabilities.approve', ['capability' => $capability->id]), [
                '_token' => $csrfToken,
                'note' => 'Approved with custom expiry.',
                'expiresAt' => $customExpiry->format('Y-m-d\TH:i'),
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $capability->refresh();

        $this->assertSame(CourierVendorCodCapability::STATUS_APPROVED, $capability->status);
        $this->assertNotNull($capability->expires_at);
        $this->assertSame($customExpiry->timestamp, $capability->expires_at->timestamp);

        $audit = CourierVendorCodCapabilityAudit::query()
            ->where('courier_vendor_cod_capability_id', (int) $capability->id)
            ->latest('id')
            ->first();

        $this->assertNotNull($audit);
        $this->assertSame('cod_capability_approved', (string) $audit->event_type);
        $this->assertSame(
            $customExpiry->format('Y-m-d H:i:s'),
            (string) data_get($audit->metadata, 'expires_at', '')
        );
    }

    public function test_superadmin_reject_requires_reason(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $capability = CourierVendorCodCapability::query()->create([
            'vendor_user_id' => $vendor->id,
            'service_workspace_id' => $workspace->id,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
            'requested_by_user_id' => $vendor->id,
            'status' => CourierVendorCodCapability::STATUS_PENDING,
            'requested_at' => now()->subMinutes(30),
        ]);

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
            'status' => 'verified',
        ]);

        $csrfToken = 'cod-reject-test-token';

        $response = $this->actingAs($superAdmin)
            ->withSession(['_token' => $csrfToken])
            ->from(route('superadmin.settings.cod-settlement.index'))
            ->post(route('superadmin.settings.cod-settlement.capabilities.reject', ['capability' => $capability->id]), [
                '_token' => $csrfToken,
                'note' => '',
            ]);

        $response->assertRedirect(route('superadmin.settings.cod-settlement.index'));
        $response->assertSessionHasErrors(['note']);

        $capability->refresh();
        $this->assertSame(CourierVendorCodCapability::STATUS_PENDING, $capability->status);
        $this->assertNull(
            CourierVendorCodCapabilityAudit::query()
                ->where('courier_vendor_cod_capability_id', (int) $capability->id)
                ->latest('id')
                ->value('event_type')
        );
    }

    public function test_superadmin_index_includes_capability_audit_timeline(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $pendingLabel = CourierVendorCodCapability::STATUS_LABELS[CourierVendorCodCapability::STATUS_PENDING] ?? 'Pending';
        $approvedLabel = CourierVendorCodCapability::STATUS_LABELS[CourierVendorCodCapability::STATUS_APPROVED] ?? 'Approved';
        $notRequestedLabel = CourierVendorCodCapability::STATUS_LABELS[CourierVendorCodCapability::STATUS_NOT_REQUESTED] ?? 'Not Requested';

        $capability = CourierVendorCodCapability::query()->create([
            'vendor_user_id' => $vendor->id,
            'service_workspace_id' => $workspace->id,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
            'requested_by_user_id' => $vendor->id,
            'status' => CourierVendorCodCapability::STATUS_PENDING,
            'requested_at' => now()->subMinutes(45),
            'requested_note' => 'Need COD for district operations.',
        ]);

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
            'status' => 'verified',
        ]);

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_request_submitted',
            CourierVendorCodCapability::STATUS_NOT_REQUESTED,
            CourierVendorCodCapability::STATUS_PENDING,
            $vendor->id,
            'Initial COD request from vendor settings.',
            [
                'source' => 'vendor_settings',
            ]
        );

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_approved',
            CourierVendorCodCapability::STATUS_PENDING,
            CourierVendorCodCapability::STATUS_APPROVED,
            $superAdmin->id,
            'Approved for rollout.',
            [
                'source' => 'superadmin_cod_settlement',
                'expires_at' => now()->addMonths(12)->format('Y-m-d H:i:s'),
            ]
        );

        $response = $this->actingAs($superAdmin)
            ->get(route('superadmin.settings.cod-settlement.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Web/home/SuperAdmin/CourierCodSettings')
            ->has('requests', 1)
            ->where('requests.0.id', (int) $capability->id)
            ->where('requests.0.auditEventCount', 2)
            ->where('requests.0.auditIntegrity.isValid', true)
            ->where('requests.0.auditIntegrity.issueCount', 0)
            ->where('requests.0.auditTrail.0.eventType', 'cod_capability_approved')
            ->where('requests.0.auditTrail.0.actorName', $superAdmin->name)
            ->where('requests.0.auditTrail.0.transitionLabel', $pendingLabel . ' -> ' . $approvedLabel)
            ->where('requests.0.auditTrail.1.eventType', 'cod_capability_request_submitted')
            ->where('requests.0.auditTrail.1.actorName', $vendor->name)
            ->where('requests.0.auditTrail.1.transitionLabel', $notRequestedLabel . ' -> ' . $pendingLabel)
        );
    }

    public function test_superadmin_index_reports_audit_integrity_issue_when_chain_is_tampered(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $capability = CourierVendorCodCapability::query()->create([
            'vendor_user_id' => $vendor->id,
            'service_workspace_id' => $workspace->id,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
            'requested_by_user_id' => $vendor->id,
            'status' => CourierVendorCodCapability::STATUS_PENDING,
            'requested_at' => now()->subMinutes(45),
        ]);

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
            'status' => 'verified',
        ]);

        $submittedAudit = CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_request_submitted',
            CourierVendorCodCapability::STATUS_NOT_REQUESTED,
            CourierVendorCodCapability::STATUS_PENDING,
            $vendor->id,
            'Initial request for cod capability.',
            [
                'source' => 'vendor_settings',
            ]
        );

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_approved',
            CourierVendorCodCapability::STATUS_PENDING,
            CourierVendorCodCapability::STATUS_APPROVED,
            $superAdmin->id,
            'Approved by superadmin.',
            [
                'source' => 'superadmin_cod_settlement',
                'expires_at' => now()->addMonths(6)->format('Y-m-d H:i:s'),
            ]
        );

        DB::table('courier_vendor_cod_capability_audits')
            ->where('id', (int) $submittedAudit->id)
            ->update([
                'record_hash' => str_repeat('a', 64),
            ]);

        $response = $this->actingAs($superAdmin)
            ->get(route('superadmin.settings.cod-settlement.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Web/home/SuperAdmin/CourierCodSettings')
            ->has('requests', 1)
            ->where('requests.0.id', (int) $capability->id)
            ->where('requests.0.auditIntegrity.isValid', false)
            ->where('requests.0.auditIntegrity.issueCount', 2)
        );
    }

    public function test_superadmin_can_fetch_capability_audit_history_with_filters(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $capability = CourierVendorCodCapability::query()->create([
            'vendor_user_id' => $vendor->id,
            'service_workspace_id' => $workspace->id,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
            'requested_by_user_id' => $vendor->id,
            'status' => CourierVendorCodCapability::STATUS_PENDING,
            'requested_at' => now()->subMinutes(45),
        ]);

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
            'status' => 'verified',
        ]);

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_request_submitted',
            CourierVendorCodCapability::STATUS_NOT_REQUESTED,
            CourierVendorCodCapability::STATUS_PENDING,
            $vendor->id,
            'Submitted from settings.',
            [
                'source' => 'vendor_settings',
            ]
        );

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_approved',
            CourierVendorCodCapability::STATUS_PENDING,
            CourierVendorCodCapability::STATUS_APPROVED,
            $superAdmin->id,
            'Approved by superadmin.',
            [
                'source' => 'superadmin_cod_settlement',
                'expires_at' => now()->addMonths(6)->format('Y-m-d H:i:s'),
            ]
        );

        $response = $this->actingAs($superAdmin)
            ->getJson(route('superadmin.settings.cod-settlement.capabilities.audit-history', [
                'capability' => $capability->id,
                'eventType' => 'cod_capability_approved',
                'actor' => substr($superAdmin->name, 0, 4),
                'from' => now()->subDay()->toDateString(),
                'to' => now()->addDay()->toDateString(),
                'perPage' => 10,
            ]));

        $response->assertOk();
        $response->assertJsonPath('capability.id', (int) $capability->id);
        $response->assertJsonPath('capability.vendorName', (string) $vendor->name);
        $response->assertJsonPath('pagination.total', 1);
        $response->assertJsonPath('filters.eventType', 'cod_capability_approved');
        $response->assertJsonPath('events.0.eventType', 'cod_capability_approved');
        $response->assertJsonPath('events.0.actorName', (string) $superAdmin->name);
        $response->assertJsonPath('integrity.isValid', true);
        $response->assertJsonPath('events.0.integrityStatus', 'valid');
    }

    public function test_superadmin_audit_history_reports_integrity_issue_when_chain_is_tampered(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $capability = CourierVendorCodCapability::query()->create([
            'vendor_user_id' => $vendor->id,
            'service_workspace_id' => $workspace->id,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
            'requested_by_user_id' => $vendor->id,
            'status' => CourierVendorCodCapability::STATUS_PENDING,
            'requested_at' => now()->subMinutes(45),
        ]);

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
            'status' => 'verified',
        ]);

        $submittedAudit = CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_request_submitted',
            CourierVendorCodCapability::STATUS_NOT_REQUESTED,
            CourierVendorCodCapability::STATUS_PENDING,
            $vendor->id,
            'Submitted from settings.',
            [
                'source' => 'vendor_settings',
            ]
        );

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_approved',
            CourierVendorCodCapability::STATUS_PENDING,
            CourierVendorCodCapability::STATUS_APPROVED,
            $superAdmin->id,
            'Approved by superadmin.',
            [
                'source' => 'superadmin_cod_settlement',
                'expires_at' => now()->addMonths(6)->format('Y-m-d H:i:s'),
            ]
        );

        DB::table('courier_vendor_cod_capability_audits')
            ->where('id', (int) $submittedAudit->id)
            ->update([
                'record_hash' => str_repeat('f', 64),
            ]);

        $response = $this->actingAs($superAdmin)
            ->getJson(route('superadmin.settings.cod-settlement.capabilities.audit-history', [
                'capability' => $capability->id,
            ]));

        $response->assertOk();
        $response->assertJsonPath('integrity.isValid', false);
        $this->assertGreaterThanOrEqual(1, (int) data_get($response->json(), 'integrity.issueCount', 0));

        $integrityStatuses = collect($response->json('events') ?? [])->pluck('integrityStatus')->all();
        $this->assertContains('issue', $integrityStatuses);
    }

    public function test_superadmin_can_open_integrity_incident_for_tampered_chain(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $capability = CourierVendorCodCapability::query()->create([
            'vendor_user_id' => $vendor->id,
            'service_workspace_id' => $workspace->id,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
            'requested_by_user_id' => $vendor->id,
            'status' => CourierVendorCodCapability::STATUS_PENDING,
            'requested_at' => now()->subMinutes(45),
        ]);

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
            'status' => 'verified',
        ]);

        $submittedAudit = CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_request_submitted',
            CourierVendorCodCapability::STATUS_NOT_REQUESTED,
            CourierVendorCodCapability::STATUS_PENDING,
            $vendor->id,
            'Submitted from settings.',
            [
                'source' => 'vendor_settings',
            ]
        );

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_approved',
            CourierVendorCodCapability::STATUS_PENDING,
            CourierVendorCodCapability::STATUS_APPROVED,
            $superAdmin->id,
            'Approved by superadmin.',
            [
                'source' => 'superadmin_cod_settlement',
                'expires_at' => now()->addMonths(6)->format('Y-m-d H:i:s'),
            ]
        );

        DB::table('courier_vendor_cod_capability_audits')
            ->where('id', (int) $submittedAudit->id)
            ->update([
                'record_hash' => str_repeat('b', 64),
            ]);

        $csrfToken = 'cod-open-integrity-incident-token';

        $response = $this->actingAs($superAdmin)
            ->withSession(['_token' => $csrfToken])
            ->post(route('superadmin.settings.cod-settlement.capabilities.incidents.open', ['capability' => $capability->id]), [
                '_token' => $csrfToken,
                'title' => 'Audit hash mismatch detected',
                'description' => 'Chain verification failed in superadmin queue.',
                'severity' => CourierVendorCodIntegrityIncident::SEVERITY_CRITICAL,
                'note' => 'Opening integrity incident for review.',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $incident = CourierVendorCodIntegrityIncident::query()
            ->where('courier_vendor_cod_capability_id', (int) $capability->id)
            ->latest('id')
            ->first();

        $this->assertNotNull($incident);
        $this->assertSame(CourierVendorCodIntegrityIncident::STATUS_OPEN, (string) $incident->status);
        $this->assertSame(CourierVendorCodIntegrityIncident::SEVERITY_CRITICAL, (string) $incident->severity);
        $this->assertSame($superAdmin->id, (int) ($incident->created_by_user_id ?? 0));
        $this->assertGreaterThanOrEqual(1, (int) ($incident->detected_issue_count ?? 0));

        $auditEventType = CourierVendorCodCapabilityAudit::query()
            ->where('courier_vendor_cod_capability_id', (int) $capability->id)
            ->latest('id')
            ->value('event_type');

        $this->assertSame('cod_integrity_incident_opened', (string) $auditEventType);
    }

    public function test_superadmin_cannot_approve_tampered_chain_without_incident(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $capability = CourierVendorCodCapability::query()->create([
            'vendor_user_id' => $vendor->id,
            'service_workspace_id' => $workspace->id,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
            'requested_by_user_id' => $vendor->id,
            'status' => CourierVendorCodCapability::STATUS_PENDING,
            'requested_at' => now()->subMinutes(45),
        ]);

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
            'status' => 'verified',
        ]);

        $submittedAudit = CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_request_submitted',
            CourierVendorCodCapability::STATUS_NOT_REQUESTED,
            CourierVendorCodCapability::STATUS_PENDING,
            $vendor->id,
            'Submitted from settings.',
            [
                'source' => 'vendor_settings',
            ]
        );

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_approved',
            CourierVendorCodCapability::STATUS_PENDING,
            CourierVendorCodCapability::STATUS_APPROVED,
            $superAdmin->id,
            'Approved by superadmin.',
            [
                'source' => 'superadmin_cod_settlement',
                'expires_at' => now()->addMonths(6)->format('Y-m-d H:i:s'),
            ]
        );

        DB::table('courier_vendor_cod_capability_audits')
            ->where('id', (int) $submittedAudit->id)
            ->update([
                'record_hash' => str_repeat('c', 64),
            ]);

        $csrfToken = 'cod-approve-integrity-guard-token';

        $response = $this->actingAs($superAdmin)
            ->withSession(['_token' => $csrfToken])
            ->from(route('superadmin.settings.cod-settlement.index'))
            ->post(route('superadmin.settings.cod-settlement.capabilities.approve', ['capability' => $capability->id]), [
                '_token' => $csrfToken,
                'note' => 'Trying to approve despite integrity issue.',
            ]);

        $response->assertRedirect(route('superadmin.settings.cod-settlement.index'));
        $response->assertSessionHasErrors(['capability']);

        $capability->refresh();
        $this->assertSame(CourierVendorCodCapability::STATUS_PENDING, (string) $capability->status);
    }

    public function test_superadmin_can_assign_and_resolve_incident_then_approve(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $capability = CourierVendorCodCapability::query()->create([
            'vendor_user_id' => $vendor->id,
            'service_workspace_id' => $workspace->id,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
            'requested_by_user_id' => $vendor->id,
            'status' => CourierVendorCodCapability::STATUS_PENDING,
            'requested_at' => now()->subHour(),
            'requested_note' => 'Ready for COD rollout.',
        ]);

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
            'status' => 'verified',
        ]);

        $submittedAudit = CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_request_submitted',
            CourierVendorCodCapability::STATUS_NOT_REQUESTED,
            CourierVendorCodCapability::STATUS_PENDING,
            $vendor->id,
            'Submitted from settings.',
            [
                'source' => 'vendor_settings',
            ]
        );

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_approved',
            CourierVendorCodCapability::STATUS_PENDING,
            CourierVendorCodCapability::STATUS_APPROVED,
            $superAdmin->id,
            'Approved by superadmin.',
            [
                'source' => 'superadmin_cod_settlement',
                'expires_at' => now()->addMonths(6)->format('Y-m-d H:i:s'),
            ]
        );

        DB::table('courier_vendor_cod_capability_audits')
            ->where('id', (int) $submittedAudit->id)
            ->update([
                'record_hash' => str_repeat('d', 64),
            ]);

        $csrfToken = 'cod-incident-workflow-token';

        $openResponse = $this->actingAs($superAdmin)
            ->withSession(['_token' => $csrfToken])
            ->post(route('superadmin.settings.cod-settlement.capabilities.incidents.open', ['capability' => $capability->id]), [
                '_token' => $csrfToken,
                'title' => 'Integrity mismatch under review',
                'description' => 'Investigate hash inconsistency before approval.',
                'severity' => CourierVendorCodIntegrityIncident::SEVERITY_HIGH,
            ]);

        $openResponse->assertRedirect();

        $incident = CourierVendorCodIntegrityIncident::query()
            ->where('courier_vendor_cod_capability_id', (int) $capability->id)
            ->latest('id')
            ->first();

        $this->assertNotNull($incident);
        $this->assertSame(CourierVendorCodIntegrityIncident::STATUS_OPEN, (string) $incident->status);

        $assignResponse = $this->actingAs($superAdmin)
            ->withSession(['_token' => $csrfToken])
            ->post(route('superadmin.settings.cod-settlement.incidents.assign', ['incident' => $incident->id]), [
                '_token' => $csrfToken,
                'note' => 'Assigned for immediate triage.',
            ]);

        $assignResponse->assertRedirect();

        $incident->refresh();
        $this->assertSame(CourierVendorCodIntegrityIncident::STATUS_INVESTIGATING, (string) $incident->status);
        $this->assertSame($superAdmin->id, (int) ($incident->assigned_to_user_id ?? 0));
        $this->assertNotNull($incident->assigned_at);

        $resolveResponse = $this->actingAs($superAdmin)
            ->withSession(['_token' => $csrfToken])
            ->post(route('superadmin.settings.cod-settlement.incidents.resolve', ['incident' => $incident->id]), [
                '_token' => $csrfToken,
                'resolutionStatus' => CourierVendorCodIntegrityIncident::STATUS_RESOLVED,
                'resolutionNote' => 'Reviewed chain mismatch and accepted documented exception.',
            ]);

        $resolveResponse->assertRedirect();

        $incident->refresh();
        $this->assertSame(CourierVendorCodIntegrityIncident::STATUS_RESOLVED, (string) $incident->status);
        $this->assertSame($superAdmin->id, (int) ($incident->resolved_by_user_id ?? 0));
        $this->assertNotNull($incident->resolved_at);

        $approveResponse = $this->actingAs($superAdmin)
            ->withSession(['_token' => $csrfToken])
            ->post(route('superadmin.settings.cod-settlement.capabilities.approve', ['capability' => $capability->id]), [
                '_token' => $csrfToken,
                'note' => 'Approved after incident resolution.',
            ]);

        $approveResponse->assertRedirect();
        $approveResponse->assertSessionHas('success');

        $capability->refresh();
        $this->assertSame(CourierVendorCodCapability::STATUS_APPROVED, (string) $capability->status);
    }

    public function test_superadmin_index_exposes_active_incident_payload(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $capability = CourierVendorCodCapability::query()->create([
            'vendor_user_id' => $vendor->id,
            'service_workspace_id' => $workspace->id,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
            'requested_by_user_id' => $vendor->id,
            'status' => CourierVendorCodCapability::STATUS_PENDING,
            'requested_at' => now()->subMinutes(45),
        ]);

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
            'status' => 'verified',
        ]);

        $submittedAudit = CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_request_submitted',
            CourierVendorCodCapability::STATUS_NOT_REQUESTED,
            CourierVendorCodCapability::STATUS_PENDING,
            $vendor->id,
            'Submitted from settings.',
            [
                'source' => 'vendor_settings',
            ]
        );

        CourierVendorCodCapabilityAudit::recordEvent(
            $capability,
            'cod_capability_approved',
            CourierVendorCodCapability::STATUS_PENDING,
            CourierVendorCodCapability::STATUS_APPROVED,
            $superAdmin->id,
            'Approved by superadmin.',
            [
                'source' => 'superadmin_cod_settlement',
                'expires_at' => now()->addMonths(6)->format('Y-m-d H:i:s'),
            ]
        );

        DB::table('courier_vendor_cod_capability_audits')
            ->where('id', (int) $submittedAudit->id)
            ->update([
                'record_hash' => str_repeat('e', 64),
            ]);

        $incident = CourierVendorCodIntegrityIncident::query()->create([
            'courier_vendor_cod_capability_id' => (int) $capability->id,
            'vendor_user_id' => (int) $vendor->id,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
            'status' => CourierVendorCodIntegrityIncident::STATUS_OPEN,
            'severity' => CourierVendorCodIntegrityIncident::SEVERITY_HIGH,
            'title' => 'Integrity mismatch detected',
            'description' => 'Manual open from operations queue.',
            'detected_issue_count' => 2,
            'detected_at' => now()->subMinutes(10),
            'created_by_user_id' => (int) $superAdmin->id,
        ]);

        $response = $this->actingAs($superAdmin)
            ->get(route('superadmin.settings.cod-settlement.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Web/home/SuperAdmin/CourierCodSettings')
            ->has('requests', 1)
            ->where('requests.0.id', (int) $capability->id)
            ->where('requests.0.isActionLocked', true)
            ->where('requests.0.canOpenIncident', false)
            ->where('requests.0.activeIncident.id', (int) $incident->id)
            ->where('requests.0.activeIncident.status', CourierVendorCodIntegrityIncident::STATUS_OPEN)
            ->where('requests.0.activeIncident.title', 'Integrity mismatch detected')
        );
    }

    public function test_vendor_request_rejects_invalid_cod_category(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership(
            $vendor,
            $workspace,
            ['courier.settings.update'],
            'courier_dispatcher'
        );

        $csrfToken = 'cod-request-invalid-category-token';

        $response = $this->actingAs($actor)
            ->withSession(['_token' => $csrfToken])
            ->from(route('courierService.settings.module', ['module' => 'services']))
            ->post(route('courierService.settings.services.cod.request'), [
                '_token' => $csrfToken,
                'note' => 'Testing invalid category validation.',
                'category' => 'overnight',
            ]);

        $response->assertRedirect(route('courierService.settings.module', ['module' => 'services']));
        $response->assertSessionHasErrors(['category']);
    }

    private function createCourierVendorWorkspace(): array
    {
        $vendor = User::factory()->create([
            'role' => 'vendor',
            'status' => 'verified',
        ]);

        $category = ServiceCategory::query()->firstOrCreate(
            ['slug' => 'courier-services'],
            [
                'name' => 'Courier Services',
                'description' => 'Courier service category for tests',
                'display_order' => 1,
                'is_active' => true,
            ]
        );

        $subCategory = ServiceSubCategory::query()->firstOrCreate(
            [
                'service_category_id' => $category->id,
                'slug' => 'domestic',
            ],
            [
                'name' => 'Courier Domestic',
                'description' => 'Courier sub category for tests',
                'required_fields' => [],
                'display_order' => 1,
                'is_active' => true,
            ]
        );

        VendorServiceRegistration::query()->create([
            'user_id' => $vendor->id,
            'service_category_id' => $category->id,
            'service_sub_category_id' => $subCategory->id,
            'field_values' => [],
            'status' => 'approved',
            'submitted_at' => now(),
            'reviewed_at' => now(),
        ]);

        $workspace = ServiceWorkspace::query()->create([
            'vendor_user_id' => $vendor->id,
            'service_key' => 'courier_service',
            'name' => 'Courier Service Workspace',
            'owner_user_id' => $vendor->id,
            'status' => 'active',
        ]);

        VendorUserMembership::query()->create([
            'vendor_user_id' => $vendor->id,
            'user_id' => $vendor->id,
            'membership_role' => 'owner',
            'status' => 'active',
            'blocked_service_keys' => [],
        ]);

        $registrar = app(PermissionRegistrar::class);
        $registrar->setPermissionsTeamId($workspace->id);
        $vendor->syncRoles(['courier_owner']);

        return [$vendor, $workspace];
    }

    private function createActorWithMembership(User $vendor, ServiceWorkspace $workspace, array $permissions, string $role): User
    {
        $actor = User::factory()->create([
            'role' => 'client',
            'status' => 'verified',
        ]);

        VendorUserMembership::query()->create([
            'vendor_user_id' => $vendor->id,
            'user_id' => $actor->id,
            'membership_role' => 'admin',
            'status' => 'active',
            'blocked_service_keys' => [],
            'invited_by_user_id' => $vendor->id,
        ]);

        $registrar = app(PermissionRegistrar::class);
        $registrar->setPermissionsTeamId($workspace->id);
        $actor->syncRoles([$role]);
        $actor->syncPermissions($permissions);

        return $actor;
    }
}
