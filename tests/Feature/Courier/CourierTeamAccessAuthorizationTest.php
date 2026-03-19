<?php

namespace Tests\Feature\Courier;

use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;
use App\Models\ServiceWorkspace;
use App\Models\User;
use App\Models\VendorServiceRegistration;
use App\Models\VendorUserMembership;
use Database\Seeders\CourierRbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class CourierTeamAccessAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(CourierRbacSeeder::class);
    }

    public function test_update_access_denies_role_change_without_assign_role_permission(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership($vendor, $workspace, ['courier.team.view']);
        $target = $this->createMemberTarget($vendor, $workspace, 'courier_viewer');

        $response = $this->actingAs($actor)->patch(
            route('courierService.team.access.update', ['user' => $target->id]),
            ['role' => 'courier_admin']
        );

        $response->assertForbidden();
    }

    public function test_update_access_denies_direct_permissions_change_without_assign_permissions_permission(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership($vendor, $workspace, [
            'courier.team.view',
            'courier.team.manage_status',
        ]);
        $target = $this->createMemberTarget($vendor, $workspace, 'courier_viewer');

        $response = $this->actingAs($actor)->patch(
            route('courierService.team.access.update', ['user' => $target->id]),
            ['directPermissions' => ['courier.clients.manage']]
        );

        $response->assertForbidden();
    }

    public function test_update_access_allows_status_change_with_manage_status_permission_only(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership($vendor, $workspace, [
            'courier.team.view',
            'courier.team.manage_status',
        ]);
        $target = $this->createMemberTarget($vendor, $workspace, 'courier_viewer');

        $response = $this->actingAs($actor)->patch(
            route('courierService.team.access.update', ['user' => $target->id]),
            ['status' => 'suspended']
        );

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('vendor_user_memberships', [
            'vendor_user_id' => $vendor->id,
            'user_id' => $target->id,
            'status' => 'suspended',
        ]);
    }

    public function test_store_forces_viewer_role_and_ignores_direct_permissions_without_assign_permissions_or_assign_role_permissions(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership($vendor, $workspace, ['courier.team.create_user']);

        $email = 'p0-1-new-member@example.com';

        $response = $this->actingAs($actor)->post(route('courierService.team.store'), [
            'name' => 'P0 User',
            'email' => $email,
            'password' => 'TempPass@123',
            'role' => 'courier_admin',
            'directPermissions' => ['courier.team.transfer_ownership'],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $created = User::query()->where('email', $email)->firstOrFail();

        $registrar = app(PermissionRegistrar::class);
        $registrar->setPermissionsTeamId($workspace->id);

        $this->assertTrue($created->hasRole('courier_viewer'));
        $this->assertCount(0, $created->permissions);
    }

    public function test_team_user_profile_update_rejects_duplicate_contact_email(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership($vendor, $workspace, ['courier.profile.update']);
        $originalEmail = (string) $actor->email;

        $existing = User::factory()->create([
            'email' => 'already.used@example.com',
            'role' => 'client',
            'status' => 'verified',
        ]);

        $response = $this->actingAs($actor)->post(route('courierService.profile.update'), [
            'section' => 'company',
            'companyName' => 'Team Member Name',
            'displayName' => 'Team Display',
            'contactEmail' => $existing->email,
            'contactPhone' => '+94 77 123 4567',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['contactEmail']);

        $this->assertSame($originalEmail, (string) $actor->fresh()->email);
    }

    private function createCourierVendorWorkspace(): array
    {
        $vendor = User::factory()->create([
            'role' => 'vendor',
            'status' => 'verified',
        ]);

        $category = ServiceCategory::query()->create([
            'name' => 'Courier Services',
            'slug' => 'courier-services',
            'description' => 'Courier service category for tests',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $subCategory = ServiceSubCategory::query()->create([
            'service_category_id' => $category->id,
            'name' => 'Courier Domestic',
            'slug' => 'courier-domestic',
            'description' => 'Courier sub category for tests',
            'required_fields' => [],
            'display_order' => 1,
            'is_active' => true,
        ]);

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

    private function createActorWithMembership(User $vendor, ServiceWorkspace $workspace, array $permissions): User
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
        $actor->syncRoles([]);
        $actor->syncPermissions($permissions);

        return $actor;
    }

    private function createMemberTarget(User $vendor, ServiceWorkspace $workspace, string $role = 'courier_viewer'): User
    {
        $target = User::factory()->create([
            'role' => 'client',
            'status' => 'verified',
        ]);

        VendorUserMembership::query()->create([
            'vendor_user_id' => $vendor->id,
            'user_id' => $target->id,
            'membership_role' => 'member',
            'status' => 'active',
            'blocked_service_keys' => [],
            'invited_by_user_id' => $vendor->id,
        ]);

        $registrar = app(PermissionRegistrar::class);
        $registrar->setPermissionsTeamId($workspace->id);
        $target->syncRoles([$role]);
        $target->syncPermissions([]);

        return $target;
    }
}
