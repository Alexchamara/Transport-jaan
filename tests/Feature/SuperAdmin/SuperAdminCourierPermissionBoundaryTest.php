<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\User;
use App\Support\SuperAdminCourierRbac;
use App\Support\SuperAdminCourierWorkspace;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class SuperAdminCourierPermissionBoundaryTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        SuperAdminCourierRbac::ensureDefinitionsExist();
    }

    public function test_superadmin_without_explicit_courier_permissions_keeps_phase_one_bootstrap_access(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $response = $this->actingAs($superAdmin)
            ->get(route('superadmin.settings.cod-settlement.index'));

        $response->assertOk();
    }

    public function test_superadmin_with_explicit_courier_permissions_needs_cod_view_permission_for_cod_settings_page(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $workspaceId = SuperAdminCourierWorkspace::idForUser($superAdmin);
        app(PermissionRegistrar::class)->setPermissionsTeamId($workspaceId);
        $superAdmin->givePermissionTo('superadmin.courier.reports.view');

        $response = $this->actingAs($superAdmin)
            ->get(route('superadmin.settings.cod-settlement.index'));

        $response->assertForbidden();
    }

    public function test_superadmin_with_explicit_payments_permission_can_access_payments_page(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $workspaceId = SuperAdminCourierWorkspace::idForUser($superAdmin);
        app(PermissionRegistrar::class)->setPermissionsTeamId($workspaceId);
        $superAdmin->givePermissionTo('superadmin.courier.payments.view');

        $response = $this->actingAs($superAdmin)
            ->get('/superadmin/payments');

        $response->assertOk();
    }

    public function test_superadmin_with_explicit_non_operations_permission_cannot_access_operations_page(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $workspaceId = SuperAdminCourierWorkspace::idForUser($superAdmin);
        app(PermissionRegistrar::class)->setPermissionsTeamId($workspaceId);
        $superAdmin->givePermissionTo('superadmin.courier.payments.view');

        $response = $this->actingAs($superAdmin)
            ->get('/superadmin/courier-operations');

        $response->assertForbidden();
    }

    public function test_superadmin_with_explicit_operations_view_permission_can_access_operations_page(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $workspaceId = SuperAdminCourierWorkspace::idForUser($superAdmin);
        app(PermissionRegistrar::class)->setPermissionsTeamId($workspaceId);
        $superAdmin->givePermissionTo('superadmin.courier.operations.view');

        $response = $this->actingAs($superAdmin)
            ->get('/superadmin/courier-operations');

        $response->assertOk();
    }

    public function test_superadmin_with_explicit_non_pricing_permission_cannot_access_pricing_governance_page(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $workspaceId = SuperAdminCourierWorkspace::idForUser($superAdmin);
        app(PermissionRegistrar::class)->setPermissionsTeamId($workspaceId);
        $superAdmin->givePermissionTo('superadmin.courier.operations.view');

        $response = $this->actingAs($superAdmin)
            ->get('/superadmin/pricing-governance');

        $response->assertForbidden();
    }

    public function test_superadmin_with_explicit_pricing_governance_view_permission_can_access_pricing_governance_page(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $workspaceId = SuperAdminCourierWorkspace::idForUser($superAdmin);
        app(PermissionRegistrar::class)->setPermissionsTeamId($workspaceId);
        $superAdmin->givePermissionTo('superadmin.courier.pricing.governance.view');

        $response = $this->actingAs($superAdmin)
            ->get('/superadmin/pricing-governance');

        $response->assertOk();
    }
}
