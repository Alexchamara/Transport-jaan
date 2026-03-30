<?php

namespace Tests\Feature\Courier;

use App\Models\Courier\VendorCourierSetting;
use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;
use App\Models\ServiceWorkspace;
use App\Models\User;
use App\Models\VendorServiceRegistration;
use App\Models\VendorUserMembership;
use Database\Seeders\CourierRbacSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Carbon;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class CourierPricingGovernanceTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow(Carbon::create(2026, 3, 30, 10, 0, 0, 'UTC'));

        $this->seed(CourierRbacSeeder::class);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_publish_now_creates_pending_approval_when_required(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership(
            $vendor,
            $workspace,
            ['courier.settings.update'],
            'courier_dispatcher'
        );

        VendorCourierSetting::query()->updateOrCreate(
            ['vendor_user_id' => $vendor->id],
            [
                'settings' => [
                    'pricing' => [
                        'governance' => [
                            'domestic' => [
                                'requireApproval' => true,
                                'approverRoles' => ['courier_admin'],
                            ],
                        ],
                    ],
                ],
            ]
        );

        $response = $this->postSettingsAction($actor, [
            'action' => 'pricing_publish_now',
            'note' => 'Needs approval',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $settings = VendorCourierSetting::query()->where('vendor_user_id', $vendor->id)->value('settings');
        $pendingApproval = $settings['pricing']['governance']['domestic']['pendingApproval'] ?? null;

        $this->assertIsArray($pendingApproval);
        $this->assertNotEmpty($pendingApproval['snapshot'] ?? null);
    }

    public function test_non_approver_cannot_approve_pending_pricing_publish(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership(
            $vendor,
            $workspace,
            ['courier.settings.update'],
            'courier_dispatcher'
        );

        VendorCourierSetting::query()->updateOrCreate(
            ['vendor_user_id' => $vendor->id],
            [
                'settings' => [
                    'pricing' => [
                        'localization' => ['baseCurrency' => 'LKR'],
                        'formula' => ['handlingFee' => 5],
                        'categories' => ['domestic' => [], 'logistic' => []],
                        'governance' => [
                            'domestic' => [
                                'approverRoles' => ['courier_admin'],
                                'pendingApproval' => [
                                    'snapshot' => [
                                        'category' => 'domestic',
                                        'localization' => ['baseCurrency' => 'LKR'],
                                        'formula' => ['handlingFee' => 99],
                                        'categories' => ['domestic' => [], 'logistic' => []],
                                    ],
                                    'requestedAt' => now()->subMinute()->toDateTimeString(),
                                    'requestedBy' => $vendor->id,
                                ],
                            ],
                        ],
                    ],
                ],
            ]
        );

        $response = $this->postSettingsAction($actor, [
            'action' => 'pricing_approve_publish',
            'pricingCategory' => 'domestic',
        ]);

        $response->assertForbidden();

        $settings = VendorCourierSetting::query()->where('vendor_user_id', $vendor->id)->value('settings');
        $this->assertIsArray($settings['pricing']['governance']['domestic']['pendingApproval'] ?? null);
    }

    public function test_approver_can_approve_pending_pricing_publish(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership(
            $vendor,
            $workspace,
            ['courier.settings.update'],
            'courier_dispatcher'
        );

        VendorCourierSetting::query()->updateOrCreate(
            ['vendor_user_id' => $vendor->id],
            [
                'settings' => [
                    'pricing' => [
                        'localization' => ['baseCurrency' => 'LKR'],
                        'formula' => ['handlingFee' => 5],
                        'categories' => ['domestic' => [], 'logistic' => []],
                        'governance' => [
                            'domestic' => [
                                'approverRoles' => ['courier_dispatcher'],
                                'pendingApproval' => [
                                    'snapshot' => [
                                        'category' => 'domestic',
                                        'localization' => ['baseCurrency' => 'LKR'],
                                        'formula' => ['handlingFee' => 99],
                                        'categories' => ['domestic' => [], 'logistic' => []],
                                    ],
                                    'requestedAt' => now()->subMinute()->toDateTimeString(),
                                    'requestedBy' => $vendor->id,
                                ],
                            ],
                        ],
                    ],
                ],
            ]
        );

        $response = $this->postSettingsAction($actor, [
            'action' => 'pricing_approve_publish',
            'pricingCategory' => 'domestic',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $settings = VendorCourierSetting::query()->where('vendor_user_id', $vendor->id)->value('settings');
        $this->assertNull($settings['pricing']['governance']['domestic']['pendingApproval'] ?? null);
        $this->assertSame(99, (int) ($settings['pricing']['formula']['domestic']['handlingFee'] ?? 0));
        $this->assertNotEmpty($settings['pricing']['governance']['domestic']['publishedAt'] ?? null);
    }

    public function test_requester_cannot_self_approve_pending_publish_even_with_approver_role(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership(
            $vendor,
            $workspace,
            ['courier.settings.update'],
            'courier_dispatcher'
        );

        VendorCourierSetting::query()->updateOrCreate(
            ['vendor_user_id' => $vendor->id],
            [
                'settings' => [
                    'pricing' => [
                        'localization' => ['baseCurrency' => 'LKR'],
                        'formula' => ['handlingFee' => 5],
                        'categories' => ['domestic' => [], 'logistic' => []],
                        'governance' => [
                            'domestic' => [
                                'approverRoles' => ['courier_dispatcher'],
                                'pendingApproval' => [
                                    'snapshot' => [
                                        'category' => 'domestic',
                                        'localization' => ['baseCurrency' => 'LKR'],
                                        'formula' => ['handlingFee' => 99],
                                        'categories' => ['domestic' => [], 'logistic' => []],
                                    ],
                                    'requestedAt' => now()->subMinute()->toDateTimeString(),
                                    'requestedBy' => $actor->id,
                                ],
                            ],
                        ],
                    ],
                ],
            ]
        );

        $response = $this->postSettingsAction($actor, [
            'action' => 'pricing_approve_publish',
            'pricingCategory' => 'domestic',
        ]);

        $response->assertForbidden();

        $settings = VendorCourierSetting::query()->where('vendor_user_id', $vendor->id)->value('settings');
        $this->assertNotNull($settings['pricing']['governance']['domestic']['pendingApproval'] ?? null);
    }

    public function test_approver_can_rollback_to_previous_published_version(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership(
            $vendor,
            $workspace,
            ['courier.settings.update'],
            'courier_dispatcher'
        );

        VendorCourierSetting::query()->updateOrCreate(
            ['vendor_user_id' => $vendor->id],
            [
                'settings' => [
                    'pricing' => [
                        'localization' => [
                            'domestic' => ['baseCurrency' => 'LKR'],
                            'logistic' => ['baseCurrency' => 'LKR'],
                        ],
                        'formula' => [
                            'domestic' => ['handlingFee' => 99],
                            'logistic' => ['handlingFee' => 5],
                        ],
                        'categories' => ['domestic' => [], 'logistic' => []],
                        'governance' => [
                            'domestic' => [
                                'approverRoles' => ['courier_dispatcher'],
                                'publishedVersion' => 3,
                                'versionHistory' => [
                                    [
                                        'version' => 3,
                                        'publishedAt' => now()->subMinutes(5)->toDateTimeString(),
                                        'publishedBy' => $vendor->id,
                                        'event' => 'published_now',
                                        'snapshot' => [
                                            'category' => 'domestic',
                                            'localization' => ['baseCurrency' => 'LKR'],
                                            'formula' => ['handlingFee' => 99],
                                            'serviceCatalog' => [],
                                            'zoneMaster' => [],
                                            'laneMatrix' => ['enabled' => false, 'rows' => []],
                                            'policyModules' => [],
                                            'categories' => [],
                                        ],
                                        'meta' => [],
                                    ],
                                    [
                                        'version' => 2,
                                        'publishedAt' => now()->subHour()->toDateTimeString(),
                                        'publishedBy' => $vendor->id,
                                        'event' => 'published_now',
                                        'snapshot' => [
                                            'category' => 'domestic',
                                            'localization' => ['baseCurrency' => 'LKR'],
                                            'formula' => ['handlingFee' => 25],
                                            'serviceCatalog' => [],
                                            'zoneMaster' => [],
                                            'laneMatrix' => ['enabled' => false, 'rows' => []],
                                            'policyModules' => [],
                                            'categories' => [],
                                        ],
                                        'meta' => [],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ]
        );

        $response = $this->postSettingsAction($actor, [
            'action' => 'pricing_rollback_version',
            'pricingCategory' => 'domestic',
            'rollbackVersion' => 2,
            'note' => 'Rollback requested in test',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $settings = VendorCourierSetting::query()->where('vendor_user_id', $vendor->id)->value('settings');
        $this->assertSame(25, (int) ($settings['pricing']['formula']['domestic']['handlingFee'] ?? 0));
        $this->assertNull($settings['pricing']['governance']['domestic']['pendingApproval'] ?? null);
        $this->assertGreaterThanOrEqual(4, (int) ($settings['pricing']['governance']['domestic']['publishedVersion'] ?? 0));
    }

    public function test_scheduled_pricing_publish_command_executes_due_snapshot(): void
    {
        [$vendor] = $this->createCourierVendorWorkspace();

        VendorCourierSetting::query()->updateOrCreate(
            ['vendor_user_id' => $vendor->id],
            [
                'settings' => [
                    'pricing' => [
                        'localization' => [
                            'domestic' => ['baseCurrency' => 'LKR'],
                            'logistic' => ['baseCurrency' => 'LKR'],
                        ],
                        'formula' => [
                            'domestic' => ['handlingFee' => 5],
                            'logistic' => ['handlingFee' => 5],
                        ],
                        'categories' => ['domestic' => [], 'logistic' => []],
                        'governance' => [
                            'domestic' => [
                                'scheduledPublish' => [
                                    'snapshot' => [
                                        'category' => 'domestic',
                                        'localization' => ['baseCurrency' => 'LKR'],
                                        'formula' => ['handlingFee' => 42],
                                        'serviceCatalog' => [],
                                        'zoneMaster' => [],
                                        'laneMatrix' => ['enabled' => false, 'rows' => []],
                                        'policyModules' => [],
                                        'categories' => [],
                                    ],
                                    'effectiveAt' => Carbon::now()->subMinutes(10)->toDateTimeString(),
                                    'scheduledBy' => $vendor->id,
                                ],
                            ],
                        ],
                    ],
                ],
            ]
        );

        $this->artisan('courier:publish-scheduled-pricing')->assertExitCode(0);

        $settings = VendorCourierSetting::query()->where('vendor_user_id', $vendor->id)->value('settings');
        $this->assertSame(42, (int) ($settings['pricing']['formula']['domestic']['handlingFee'] ?? 0));
        $this->assertNull($settings['pricing']['governance']['domestic']['scheduledPublish'] ?? null);
        $this->assertNotEmpty($settings['pricing']['governance']['domestic']['publishedAt'] ?? null);
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

    private function postSettingsAction(User $actor, array $payload)
    {
        $csrfToken = 'pricing-governance-test-token';

        return $this->actingAs($actor)
            ->withSession(['_token' => $csrfToken])
            ->post(route('courierService.settings.update'), $payload + ['_token' => $csrfToken]);
    }
}
