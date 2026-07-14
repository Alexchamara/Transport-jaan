<?php

namespace Tests\Feature\SuperAdmin;

use App\Http\Middleware\VerifyCsrfToken;
use App\Http\Middleware\EnsureServicePermission;
use App\Http\Middleware\CourierSessionSecurityMiddleware;
use App\Http\Middleware\CourierAccessReviewLifecycle;
use App\Models\Courier\VendorCourierSetting;
use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;
use App\Models\ServiceWorkspace;
use App\Models\User;
use App\Models\VendorServiceRegistration;
use App\Models\VendorUserMembership;
use App\Support\SuperAdminCourierRbac;
use App\Support\SuperAdminCourierWorkspace;
use Database\Seeders\CourierRbacSeeder;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class SuperAdminCourierPricingGovernanceTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->withoutMiddleware(VerifyCsrfToken::class);
        $this->withoutMiddleware(ValidateCsrfToken::class);
        $this->withoutMiddleware(CourierSessionSecurityMiddleware::class);
        $this->withoutMiddleware(CourierAccessReviewLifecycle::class);

        SuperAdminCourierRbac::ensureDefinitionsExist();
        $this->seed(CourierRbacSeeder::class);
    }

    public function test_superadmin_can_approve_pending_pricing_publish_and_audit_is_recorded(): void
    {
        if (!Schema::hasTable('superadmin_courier_pricing_governance_audits')) {
            $this->markTestSkipped('superadmin_courier_pricing_governance_audits table is missing. Run migrations before running this suite.');
        }

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);
        $this->grantSuperAdminPermissions($superAdmin, [
            'superadmin.courier.pricing.governance.view',
            'superadmin.courier.pricing.governance.review',
            'superadmin.courier.pricing.governance.audit.view',
        ]);

        $vendor = User::factory()->create([
            'role' => 'vendor',
            'status' => 'verified',
        ]);

        $this->seedPendingPricingGovernanceSettings($vendor->id, 'superadmin');

        $this->actingAs($superAdmin)
            ->post('/superadmin/pricing-governance/vendors/' . $vendor->id . '/categories/domestic/approve', [
                'note' => 'Approved after policy and margin review.',
            ])
            ->assertRedirect();

        $settings = VendorCourierSetting::query()
            ->where('vendor_user_id', $vendor->id)
            ->value('settings');

        $this->assertNull($settings['pricing']['governance']['domestic']['pendingApproval'] ?? null);
        $this->assertSame(99, (int) ($settings['pricing']['formula']['domestic']['handlingFee'] ?? 0));

        $this->assertDatabaseHas('superadmin_courier_pricing_governance_audits', [
            'vendor_user_id' => $vendor->id,
            'pricing_category' => 'domestic',
            'action_type' => 'pricing_publish_approved',
        ]);
    }

    public function test_superadmin_policy_update_enforces_require_approval_when_authority_is_superadmin(): void
    {
        if (!Schema::hasTable('superadmin_courier_pricing_governance_audits')) {
            $this->markTestSkipped('superadmin_courier_pricing_governance_audits table is missing. Run migrations before running this suite.');
        }

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);
        $this->grantSuperAdminPermissions($superAdmin, [
            'superadmin.courier.pricing.governance.policy.manage',
        ]);

        $vendor = User::factory()->create([
            'role' => 'vendor',
            'status' => 'verified',
        ]);

        VendorCourierSetting::query()->updateOrCreate(
            ['vendor_user_id' => $vendor->id],
            [
                'settings' => [
                    'pricing' => [
                        'governance' => [
                            'domestic' => [
                                'approvalAuthority' => 'vendor',
                                'requireApproval' => false,
                                'approverRoles' => ['courier_owner'],
                            ],
                        ],
                    ],
                ],
            ]
        );

        $this->actingAs($superAdmin)
            ->post('/superadmin/pricing-governance/vendors/' . $vendor->id . '/categories/domestic/policy', [
                'approvalAuthority' => 'superadmin',
                'requireApproval' => false,
                'note' => 'Centralizing approval controls in phase 4.',
            ])
            ->assertRedirect();

        $settings = VendorCourierSetting::query()
            ->where('vendor_user_id', $vendor->id)
            ->value('settings');

        $this->assertSame('superadmin', (string) ($settings['pricing']['governance']['domestic']['approvalAuthority'] ?? 'vendor'));
        $this->assertTrue((bool) ($settings['pricing']['governance']['domestic']['requireApproval'] ?? false));

        $this->assertDatabaseHas('superadmin_courier_pricing_governance_audits', [
            'vendor_user_id' => $vendor->id,
            'pricing_category' => 'domestic',
            'action_type' => 'pricing_policy_updated',
        ]);
    }

    public function test_vendor_cannot_approve_pending_pricing_when_superadmin_is_authority(): void
    {
        [$vendor] = $this->createCourierVendorWorkspace();

        $this->seedPendingPricingGovernanceSettings($vendor->id, 'superadmin');

        $this->withoutMiddleware(EnsureServicePermission::class);

        $response = $this->actingAs($vendor)
            ->post(route('courierService.settings.update'), [
                'action' => 'pricing_approve_publish',
                'pricingCategory' => 'domestic',
            ]);

        $response->assertForbidden();

        $settings = VendorCourierSetting::query()
            ->where('vendor_user_id', $vendor->id)
            ->value('settings');

        $this->assertNotNull($settings['pricing']['governance']['domestic']['pendingApproval'] ?? null);
    }

    /**
     * @param array<int, string> $permissions
     */
    private function grantSuperAdminPermissions(User $superAdmin, array $permissions): void
    {
        $workspaceId = SuperAdminCourierWorkspace::idForUser($superAdmin);
        app(PermissionRegistrar::class)->setPermissionsTeamId($workspaceId);

        foreach ($permissions as $permission) {
            $superAdmin->givePermissionTo($permission);
        }
    }

    private function seedPendingPricingGovernanceSettings(int $vendorUserId, string $approvalAuthority): void
    {
        VendorCourierSetting::query()->updateOrCreate(
            ['vendor_user_id' => $vendorUserId],
            [
                'settings' => [
                    'pricing' => [
                        'localization' => [
                            'domestic' => ['baseCurrency' => 'LKR'],
                            'international' => ['baseCurrency' => 'LKR'],
                        ],
                        'formula' => [
                            'domestic' => ['handlingFee' => 5],
                            'international' => ['handlingFee' => 5],
                        ],
                        'serviceCatalog' => [
                            'domestic' => [],
                            'international' => [],
                        ],
                        'zoneMaster' => [
                            'domestic' => [],
                            'international' => [],
                        ],
                        'cityZoneMap' => [
                            'domestic' => [],
                            'international' => [],
                        ],
                        'laneMatrix' => [
                            'enabled' => [
                                'domestic' => false,
                                'international' => false,
                            ],
                            'domestic' => [],
                            'international' => [],
                        ],
                        'policyModules' => [
                            'domestic' => [],
                            'international' => [],
                        ],
                        'categories' => [
                            'domestic' => [],
                            'international' => [],
                        ],
                        'governance' => [
                            'domestic' => [
                                'approvalAuthority' => $approvalAuthority,
                                'requireApproval' => true,
                                'approverRoles' => ['courier_owner'],
                                'draftVersion' => 2,
                                'publishedVersion' => 1,
                                'publishedAt' => now()->subDay()->toDateTimeString(),
                                'publishedBy' => $vendorUserId,
                                'pendingApproval' => [
                                    'snapshot' => [
                                        'category' => 'domestic',
                                        'localization' => ['baseCurrency' => 'LKR'],
                                        'formula' => ['handlingFee' => 99],
                                        'serviceCatalog' => [],
                                        'zoneMaster' => [],
                                        'cityZoneMap' => [],
                                        'laneMatrix' => ['enabled' => false, 'rows' => []],
                                        'policyModules' => [],
                                        'categories' => [],
                                    ],
                                    'requestedAt' => now()->subMinutes(5)->toDateTimeString(),
                                    'requestedBy' => $vendorUserId,
                                    'note' => 'Need superadmin approval for seasonal update',
                                ],
                                'scheduledPublish' => null,
                                'versionHistory' => [
                                    [
                                        'version' => 1,
                                        'publishedAt' => now()->subDay()->toDateTimeString(),
                                        'publishedBy' => $vendorUserId,
                                        'event' => 'published_now',
                                        'snapshot' => [
                                            'category' => 'domestic',
                                            'localization' => ['baseCurrency' => 'LKR'],
                                            'formula' => ['handlingFee' => 5],
                                            'serviceCatalog' => [],
                                            'zoneMaster' => [],
                                            'cityZoneMap' => [],
                                            'laneMatrix' => ['enabled' => false, 'rows' => []],
                                            'policyModules' => [],
                                            'categories' => [],
                                        ],
                                        'meta' => [],
                                    ],
                                ],
                                'changeLog' => [],
                            ],
                            'international' => [
                                'approvalAuthority' => 'vendor',
                                'requireApproval' => false,
                                'approverRoles' => ['courier_owner'],
                                'draftVersion' => 1,
                                'publishedVersion' => 1,
                                'publishedAt' => null,
                                'publishedBy' => null,
                                'pendingApproval' => null,
                                'scheduledPublish' => null,
                                'versionHistory' => [],
                                'changeLog' => [],
                            ],
                        ],
                    ],
                ],
            ]
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
        $vendor->givePermissionTo('courier.settings.update');

        return [$vendor, $workspace];
    }
}
