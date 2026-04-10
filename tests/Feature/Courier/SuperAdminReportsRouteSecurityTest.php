<?php

namespace Tests\Feature\Courier;

use App\Models\User;
use App\Support\SuperAdminCourierRbac;
use App\Support\SuperAdminCourierWorkspace;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class SuperAdminReportsRouteSecurityTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        SuperAdminCourierRbac::ensureDefinitionsExist();
    }

    public function test_non_superadmin_cannot_access_canonical_courier_report_route(): void
    {
        $client = User::factory()->create([
            'role' => 'client',
        ]);

        $response = $this->actingAs($client)
            ->get('/superadmin/reports/courier');

        $response->assertForbidden();
    }

    public function test_superadmin_can_access_canonical_courier_report_route(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $response = $this->actingAs($superAdmin)
            ->get('/superadmin/reports/courier');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Web/home/SuperAdmin/CourierReports')
        );
    }

    public function test_superadmin_with_explicit_non_report_permission_cannot_access_courier_report_route(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $workspaceId = SuperAdminCourierWorkspace::idForUser($superAdmin);
        app(PermissionRegistrar::class)->setPermissionsTeamId($workspaceId);
        $superAdmin->givePermissionTo('superadmin.courier.payments.view');

        $response = $this->actingAs($superAdmin)
            ->get('/superadmin/reports/courier');

        $response->assertForbidden();
    }

    public function test_legacy_courier_report_route_redirects_to_canonical_path(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $response = $this->actingAs($superAdmin)
            ->get('/SuperAdmin/reports/courier');

        $response->assertRedirect('/superadmin/reports/courier');
    }
}
