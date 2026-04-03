<?php

namespace Tests\Feature\Courier;

use App\Models\Courier\CourierVendorCodCapability;
use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;
use App\Models\ServiceWorkspace;
use App\Models\User;
use App\Models\VendorServiceRegistration;
use App\Models\VendorUserMembership;
use Database\Seeders\CourierRbacSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class CourierCodCapabilityRequestTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

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
        ]);

        $capability = CourierVendorCodCapability::query()
            ->where('vendor_user_id', $vendor->id)
            ->first();

        $this->assertNotNull($capability);
        $this->assertSame(CourierVendorCodCapability::STATUS_PENDING, $capability->status);
        $this->assertSame($actor->id, (int) $capability->requested_by_user_id);
        $this->assertNotNull($capability->requested_at);
    }

    public function test_superadmin_can_approve_pending_cod_request(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $capability = CourierVendorCodCapability::query()->create([
            'vendor_user_id' => $vendor->id,
            'service_workspace_id' => $workspace->id,
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
        $this->assertSame('Approved after readiness review.', $capability->decision_reason);
    }

    public function test_superadmin_reject_requires_reason(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $capability = CourierVendorCodCapability::query()->create([
            'vendor_user_id' => $vendor->id,
            'service_workspace_id' => $workspace->id,
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
