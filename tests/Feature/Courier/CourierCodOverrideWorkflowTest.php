<?php

namespace Tests\Feature\Courier;

use App\Models\Courier\CourierAddress;
use App\Models\Courier\CourierContact;
use App\Models\Courier\CourierSensitiveActionApproval;
use App\Models\Courier\CourierShipment;
use App\Models\Courier\CourierVendorCodCapability;
use App\Models\Courier\CourierVendorCodCapabilityAudit;
use App\Models\Courier\VendorCourierSetting;
use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;
use App\Models\ServiceWorkspace;
use App\Models\User;
use App\Models\VendorServiceRegistration;
use App\Models\VendorUserMembership;
use Carbon\Carbon;
use Database\Seeders\CourierRbacSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class CourierCodOverrideWorkflowTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->withoutMiddleware(ValidateCsrfToken::class);
        Carbon::setTestNow(Carbon::create(2026, 4, 9, 11, 0, 0, 'UTC'));

        $this->seed(CourierRbacSeeder::class);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_cod_override_action_requires_cod_override_permission(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership($vendor, $workspace, []);

        $this->createApprovedCodCapability($vendor, $workspace, $vendor);
        $shipment = $this->createDeliveredCodShipment($vendor, [
            'cod_requested_amount' => 1800,
        ]);

        $response = $this->actingAs($actor)->post(
            route('courierService.bookings.lifecycle', ['shipment' => $shipment->id]),
            ['action' => 'cod_failed']
        );

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $shipment->refresh();
        $this->assertNull($shipment->cod_collection_status);
        $this->assertNull($shipment->cod_collected_amount);

        $this->assertNull(
            CourierSensitiveActionApproval::query()
                ->where('action_key', 'cod_override')
                ->first()
        );
    }

    public function test_cod_override_queues_thresholded_approval_before_execution(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership($vendor, $workspace, [
            'courier.services.cod.override',
        ]);

        $this->configureCodOverrideApprovalPolicy($vendor, [
            'level1MinAmount' => 500,
            'level2MinAmount' => 1000,
            'requiredApprovalsLevel1' => 1,
            'requiredApprovalsLevel2' => 2,
        ]);

        $this->createApprovedCodCapability($vendor, $workspace, $vendor);
        $shipment = $this->createDeliveredCodShipment($vendor, [
            'cod_requested_amount' => 1500,
        ]);

        $response = $this->actingAs($actor)->post(
            route('courierService.bookings.lifecycle', ['shipment' => $shipment->id]),
            ['action' => 'cod_failed']
        );

        $response->assertRedirect();
        $response->assertSessionHas('error', function ($message) {
            return str_contains(strtolower((string) $message), 'requires approval');
        });

        $shipment->refresh();
        $this->assertNull($shipment->cod_collection_status);

        $approval = CourierSensitiveActionApproval::query()
            ->where('action_key', 'cod_override')
            ->latest('id')
            ->first();

        $this->assertNotNull($approval);
        $this->assertSame('pending', (string) $approval->status);
        $this->assertSame(2, (int) $approval->required_approvals);
        $this->assertEqualsWithDelta(1500.0, (float) ($approval->amount ?? 0), 0.01);

        $this->assertNull(
            CourierVendorCodCapabilityAudit::query()
                ->where('event_type', 'cod_collection_override_failed')
                ->first()
        );
    }

    public function test_cod_override_executes_after_approval_and_writes_immutable_audit_event(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $requester = $this->createActorWithMembership($vendor, $workspace, [
            'courier.services.cod.override',
        ]);

        $approver = $this->createActorWithMembership($vendor, $workspace, [
        ], 'courier_admin');

        $this->configureCodOverrideApprovalPolicy($vendor, [
            'level1MinAmount' => 100,
            'level2MinAmount' => 100000,
            'requiredApprovalsLevel1' => 1,
            'requiredApprovalsLevel2' => 2,
        ]);

        $capability = $this->createApprovedCodCapability($vendor, $workspace, $vendor);
        $shipment = $this->createDeliveredCodShipment($vendor, [
            'cod_requested_amount' => 750,
        ]);

        $this->actingAs($requester)->post(
            route('courierService.bookings.lifecycle', ['shipment' => $shipment->id]),
            ['action' => 'cod_failed']
        )->assertRedirect();

        $approval = CourierSensitiveActionApproval::query()
            ->where('action_key', 'cod_override')
            ->latest('id')
            ->firstOrFail();

        $this->actingAs($approver)->postJson(
            route('courierService.team.sensitive-approvals.approve', ['approval' => $approval->id])
        )->assertOk();

        $response = $this->actingAs($requester)->post(
            route('courierService.bookings.lifecycle', ['shipment' => $shipment->id]),
            ['action' => 'cod_failed']
        );

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $shipment->refresh();
        $this->assertSame('failed', (string) $shipment->cod_collection_status);
        $this->assertEqualsWithDelta(0.0, (float) ($shipment->cod_collected_amount ?? 0), 0.01);
        $this->assertNotNull($shipment->cod_collection_recorded_at);

        $approval->refresh();
        $this->assertSame('executed', (string) $approval->status);

        $audit = CourierVendorCodCapabilityAudit::query()
            ->where('courier_vendor_cod_capability_id', $capability->id)
            ->where('event_type', 'cod_collection_override_failed')
            ->latest('id')
            ->first();

        $this->assertNotNull($audit);
        $this->assertSame((int) $shipment->id, (int) ($audit->metadata['shipmentId'] ?? 0));
        $this->assertEqualsWithDelta(750.0, (float) ($audit->metadata['overrideAmount'] ?? 0), 0.01);
        $this->assertSame('cod_failed', (string) ($audit->metadata['bookingAction'] ?? ''));
        $this->assertSame('failed', (string) ($audit->to_status ?? ''));
    }

    public function test_units_payload_exposes_cod_collection_context_for_shipment_operations(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership($vendor, $workspace, [
            'courier.shipments.view',
            'courier.bookings.manage_lifecycle',
            'courier.services.cod.override',
        ]);

        $shipment = $this->createDeliveredCodShipment($vendor, [
            'cod_requested_amount' => 1650,
            'cod_collected_amount' => null,
            'cod_collection_status' => null,
            'cod_collection_recorded_at' => null,
        ]);

        $response = $this->actingAs($actor)->get(route('courierService.units'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('courierShipments.rows.0.id', (int) $shipment->id)
            ->where('courierShipments.rows.0.codEnabled', true)
            ->where('courierShipments.rows.0.canManageBookingLifecycle', true)
            ->where('courierShipments.rows.0.canCodOverride', true)
            ->where('courierShipments.rows.0.codRequestedAmount', 1650)
            ->where('courierShipments.rows.0.codCollectionStatus', null)
            ->where('courierShipments.rows.0.codCollectedAmount', null)
            ->where('courierShipments.rows.0.codAllowedActions', ['cod_collected', 'cod_failed', 'cod_refused'])
        );
    }

    public function test_units_payload_hides_cod_collection_actions_without_booking_lifecycle_permission(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership($vendor, $workspace, [
            'courier.shipments.view',
        ], 'courier_viewer');

        $shipment = $this->createDeliveredCodShipment($vendor, [
            'cod_requested_amount' => 900,
        ]);

        $response = $this->actingAs($actor)->get(route('courierService.units'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('courierShipments.rows.0.id', (int) $shipment->id)
            ->where('courierShipments.rows.0.canManageBookingLifecycle', false)
            ->where('courierShipments.rows.0.codAllowedActions', [])
        );
    }

    public function test_tracking_payload_exposes_cod_collection_context_for_shipment_operations(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership($vendor, $workspace, [
            'courier.tracking.view',
            'courier.bookings.manage_lifecycle',
            'courier.services.cod.override',
        ]);

        $shipment = $this->createDeliveredCodShipment($vendor, [
            'cod_requested_amount' => 1250,
            'cod_collected_amount' => 600,
            'cod_collection_status' => 'partially_collected',
            'cod_collection_recorded_at' => now()->subMinutes(10),
        ]);

        $response = $this->actingAs($actor)->get(route('courierService.tracking'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('courierTracking.rows.0.id', (int) $shipment->id)
            ->where('courierTracking.rows.0.codEnabled', true)
            ->where('courierTracking.rows.0.canManageBookingLifecycle', true)
            ->where('courierTracking.rows.0.canCodOverride', true)
            ->where('courierTracking.rows.0.codRequestedAmount', 1250)
            ->where('courierTracking.rows.0.codCollectionStatus', 'partially_collected')
            ->where('courierTracking.rows.0.codCollectedAmount', 600)
            ->where('courierTracking.rows.0.codAllowedActions', ['cod_collected', 'cod_failed', 'cod_refused'])
        );
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

        VendorCourierSetting::query()->updateOrCreate(
            ['vendor_user_id' => $vendor->id],
            ['settings' => [
                'services' => [
                    'cod' => [
                        'allowTeamOverride' => true,
                    ],
                ],
                'team' => [
                    'sessionSecurity' => [
                        'enabled' => false,
                    ],
                    'permissionModel' => [
                        'enabled' => false,
                    ],
                ],
            ]],
        );

        return [$vendor, $workspace];
    }

    private function createActorWithMembership(
        User $vendor,
        ServiceWorkspace $workspace,
        array $permissions,
        string $role = 'courier_dispatcher'
    ): User
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

    private function createApprovedCodCapability(User $vendor, ServiceWorkspace $workspace, User $requestedBy): CourierVendorCodCapability
    {
        return CourierVendorCodCapability::query()->create([
            'vendor_user_id' => $vendor->id,
            'service_workspace_id' => $workspace->id,
            'category' => CourierVendorCodCapability::CATEGORY_DOMESTIC,
            'requested_by_user_id' => $requestedBy->id,
            'status' => CourierVendorCodCapability::STATUS_APPROVED,
            'requested_at' => now()->subDays(3),
            'approved_at' => now()->subDays(2),
            'reviewed_at' => now()->subDays(2),
            'reviewed_by_user_id' => $vendor->id,
            'expires_at' => now()->addDays(30),
            'requested_note' => 'Test capability request',
            'decision_reason' => 'Approved for tests',
        ]);
    }

    private function configureCodOverrideApprovalPolicy(User $vendor, array $overrides): void
    {
        VendorCourierSetting::query()->updateOrCreate(
            ['vendor_user_id' => $vendor->id],
            ['settings' => [
                'services' => [
                    'cod' => [
                        'allowTeamOverride' => true,
                    ],
                ],
                'team' => [
                    'sessionSecurity' => [
                        'enabled' => false,
                    ],
                    'permissionModel' => [
                        'enabled' => false,
                    ],
                    'approvalControl' => [
                        'enabled' => true,
                        'makerChecker' => true,
                        'approvalTtlMinutes' => 240,
                        'sensitiveActions' => [
                            'cod_override' => [
                                'enabled' => true,
                                'level1MinAmount' => (float) ($overrides['level1MinAmount'] ?? 25000),
                                'level2MinAmount' => (float) ($overrides['level2MinAmount'] ?? 100000),
                                'requiredApprovalsLevel1' => (int) ($overrides['requiredApprovalsLevel1'] ?? 1),
                                'requiredApprovalsLevel2' => (int) ($overrides['requiredApprovalsLevel2'] ?? 2),
                            ],
                        ],
                    ],
                ],
            ]],
        );
    }

    private function createDeliveredCodShipment(User $vendor, array $overrides = []): CourierShipment
    {
        $registrationId = (int) VendorServiceRegistration::query()
            ->where('user_id', $vendor->id)
            ->where('status', 'approved')
            ->value('id');

        $sender = CourierContact::query()->create([
            'name' => 'Sender Test',
            'email' => 'sender+' . uniqid() . '@example.com',
        ]);

        $recipient = CourierContact::query()->create([
            'name' => 'Recipient Test',
            'email' => 'recipient+' . uniqid() . '@example.com',
        ]);

        $senderAddress = CourierAddress::query()->create([
            'contact_id' => $sender->id,
            'line1' => 'Sender Line 1',
            'city' => 'Colombo',
            'country' => 'LK',
        ]);

        $recipientAddress = CourierAddress::query()->create([
            'contact_id' => $recipient->id,
            'line1' => 'Recipient Line 1',
            'city' => 'Kandy',
            'country' => 'LK',
        ]);

        return CourierShipment::query()->create(array_merge([
            'reference' => 'CR-COD-OVR-' . strtoupper(substr(sha1((string) microtime(true)), 0, 8)),
            'assigned_vendor_user_id' => $vendor->id,
            'sender_contact_id' => $sender->id,
            'recipient_contact_id' => $recipient->id,
            'sender_address_id' => $senderAddress->id,
            'recipient_address_id' => $recipientAddress->id,
            'service_level' => 'express',
            'status' => CourierShipment::STATUS_DELIVERED,
            'assignment_status' => CourierShipment::ASSIGNMENT_STATUS_ASSIGNED,
            'assigned_vendor_registration_id' => $registrationId > 0 ? $registrationId : null,
            'assignment_category' => 'domestic',
            'assigned_at' => now(),
            'estimated_cost' => 5200,
            'currency_code' => 'LKR',
            'is_cod_enabled' => true,
            'cod_requested_amount' => 1200,
            'cod_requested_method' => 'cash',
        ], $overrides));
    }
}
