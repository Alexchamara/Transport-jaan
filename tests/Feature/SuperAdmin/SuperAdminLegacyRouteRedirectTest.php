<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class SuperAdminLegacyRouteRedirectTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_legacy_payments_route_redirects_to_canonical_superadmin_path(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $response = $this->actingAs($superAdmin)
            ->get('/SuperAdmin/payments');

        $response->assertRedirect('/superadmin/payments');
    }

    public function test_legacy_settings_commission_route_redirects_to_canonical_superadmin_path(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $response = $this->actingAs($superAdmin)
            ->get('/SuperAdmin/settings/commission');

        $response->assertRedirect('/superadmin/settings/commission');
    }

    public function test_non_superadmin_cannot_access_canonical_superadmin_payments_route(): void
    {
        $client = User::factory()->create([
            'role' => 'client',
        ]);

        $response = $this->actingAs($client)
            ->get('/superadmin/payments');

        $response->assertForbidden();
    }

    public function test_superadmin_can_access_canonical_superadmin_payments_route(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $response = $this->actingAs($superAdmin)
            ->get('/superadmin/payments');

        $response->assertOk();
    }
}
