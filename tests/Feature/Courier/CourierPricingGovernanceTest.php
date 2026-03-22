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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class CourierPricingGovernanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(CourierRbacSeeder::class);
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
                            'requireApproval' => true,
                            'approverRoles' => ['courier_admin'],
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
        $pendingApproval = $settings['pricing']['governance']['pendingApproval'] ?? null;

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
                            'approverRoles' => ['courier_admin'],
                            'pendingApproval' => [
                                'snapshot' => [
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
            ]
        );

        $response = $this->postSettingsAction($actor, [
            'action' => 'pricing_approve_publish',
        ]);

        $response->assertForbidden();

        $settings = VendorCourierSetting::query()->where('vendor_user_id', $vendor->id)->value('settings');
        $this->assertIsArray($settings['pricing']['governance']['pendingApproval'] ?? null);
    }

    public function test_approver_can_approve_pending_pricing_publish(): void
    {
        [$vendor, $workspace] = $this->createCourierVendorWorkspace();

        $actor = $this->createActorWithMembership(
            $vendor,
            $workspace,
            ['courier.settings.update'],
            'courier_admin'
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
                            'approverRoles' => ['courier_admin'],
                            'pendingApproval' => [
                                'snapshot' => [
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
            ]
        );

        $response = $this->postSettingsAction($actor, [
            'action' => 'pricing_approve_publish',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $settings = VendorCourierSetting::query()->where('vendor_user_id', $vendor->id)->value('settings');
        $this->assertNull($settings['pricing']['governance']['pendingApproval'] ?? null);
        $this->assertSame(99, (int) ($settings['pricing']['formula']['handlingFee'] ?? 0));
        $this->assertNotEmpty($settings['pricing']['governance']['publishedAt'] ?? null);
    }

    public function test_scheduled_pricing_publish_command_executes_due_snapshot(): void
    {
        [$vendor] = $this->createCourierVendorWorkspace();

        VendorCourierSetting::query()->updateOrCreate(
            ['vendor_user_id' => $vendor->id],
            [
                'settings' => [
                    'pricing' => [
                        'localization' => ['baseCurrency' => 'LKR'],
                        'formula' => ['handlingFee' => 5],
                        'categories' => ['domestic' => [], 'logistic' => []],
                        'governance' => [
                            'scheduledPublish' => [
                                'snapshot' => [
                                    'localization' => ['baseCurrency' => 'LKR'],
                                    'formula' => ['handlingFee' => 42],
                                    'categories' => ['domestic' => [], 'logistic' => []],
                                ],
                                'effectiveAt' => Carbon::now()->subMinutes(10)->toDateTimeString(),
                                'scheduledBy' => $vendor->id,
                            ],
                        ],
                    ],
                ],
            ]
        );

        $this->artisan('courier:publish-scheduled-pricing')->assertExitCode(0);

        $settings = VendorCourierSetting::query()->where('vendor_user_id', $vendor->id)->value('settings');
        $this->assertSame(42, (int) ($settings['pricing']['formula']['handlingFee'] ?? 0));
        $this->assertNull($settings['pricing']['governance']['scheduledPublish'] ?? null);
        $this->assertNotEmpty($settings['pricing']['governance']['publishedAt'] ?? null);
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
