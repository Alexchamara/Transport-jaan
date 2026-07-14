<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\Courier\CourierAddress;
use App\Models\Courier\CourierContact;
use App\Models\Courier\CourierShipment;
use App\Models\User;
use App\Support\SuperAdminCourierRbac;
use App\Support\SuperAdminCourierWorkspace;
use App\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class SuperAdminCourierOperationsInterventionTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->withoutMiddleware(VerifyCsrfToken::class);
        $this->withoutMiddleware(ValidateCsrfToken::class);
        SuperAdminCourierRbac::ensureDefinitionsExist();
    }

    public function test_superadmin_can_freeze_and_unfreeze_shipment_and_audits_are_recorded(): void
    {
        if (! Schema::hasTable('superadmin_courier_action_audits')) {
            $this->markTestSkipped('superadmin_courier_action_audits table is missing. Run migrations before running this suite.');
        }

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);
        $this->grantSuperAdminPermissions($superAdmin, [
            'superadmin.courier.operations.view',
            'superadmin.courier.operations.freeze',
        ]);

        $client = User::factory()->create([
            'role' => 'client',
        ]);

        $shipment = $this->createShipmentForUser($client, [
            'status' => CourierShipment::STATUS_CONFIRMED,
        ]);

        $freezeReason = 'Fraud review opened by governance team.';

        $this->actingAs($superAdmin)
            ->post('/superadmin/courier-operations/shipments/' . $shipment->id . '/freeze', [
                'reason' => $freezeReason,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('superadmin_courier_action_audits', [
            'shipment_id' => $shipment->id,
            'action_type' => 'operations_frozen',
            'reason' => $freezeReason,
        ]);

        $unfreezeReason = 'Fraud review completed and shipment is clear.';

        $this->actingAs($superAdmin)
            ->post('/superadmin/courier-operations/shipments/' . $shipment->id . '/unfreeze', [
                'reason' => $unfreezeReason,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('superadmin_courier_action_audits', [
            'shipment_id' => $shipment->id,
            'action_type' => 'operations_unfrozen',
            'reason' => $unfreezeReason,
        ]);
    }

    public function test_client_cannot_cancel_when_shipment_is_frozen_by_superadmin(): void
    {
        if (! Schema::hasTable('superadmin_courier_action_audits')) {
            $this->markTestSkipped('superadmin_courier_action_audits table is missing. Run migrations before running this suite.');
        }

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);
        $this->grantSuperAdminPermissions($superAdmin, [
            'superadmin.courier.operations.view',
            'superadmin.courier.operations.freeze',
        ]);

        $client = User::factory()->create([
            'role' => 'client',
        ]);

        $shipment = $this->createShipmentForUser($client, [
            'status' => CourierShipment::STATUS_CONFIRMED,
        ]);

        $this->actingAs($superAdmin)
            ->post('/superadmin/courier-operations/shipments/' . $shipment->id . '/freeze', [
                'reason' => 'Compliance hold for identity verification.',
            ])
            ->assertRedirect();

        $response = $this->actingAs($client)
            ->post(route('courier.shipment.cancel', ['id' => $shipment->id]));

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Shipment operations are temporarily frozen by SuperAdmin.');

        $this->assertDatabaseMissing('courier_shipments', [
            'id' => $shipment->id,
            'status' => CourierShipment::STATUS_CANCELLED,
        ]);
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

    /**
     * @param array<string, mixed> $overrides
     */
    private function createShipmentForUser(User $user, array $overrides = []): CourierShipment
    {
        $sender = CourierContact::query()->create([
            'user_id' => $user->id,
            'role' => CourierContact::ROLE_SENDER,
            'name' => 'Sender Test',
            'email' => 'sender+' . uniqid() . '@example.com',
            'phone' => '+94112223344',
        ]);

        $recipient = CourierContact::query()->create([
            'user_id' => $user->id,
            'role' => CourierContact::ROLE_RECIPIENT,
            'name' => 'Recipient Test',
            'email' => 'recipient+' . uniqid() . '@example.com',
            'phone' => '+94119998877',
        ]);

        $senderAddress = CourierAddress::query()->create([
            'contact_id' => $sender->id,
            'label' => 'pickup',
            'line1' => '10 Test Lane',
            'city' => 'Colombo',
            'postal_code' => '00100',
            'country' => 'LK',
            'is_primary' => true,
        ]);

        $recipientAddress = CourierAddress::query()->create([
            'contact_id' => $recipient->id,
            'label' => 'dropoff',
            'line1' => '11 Receiver Street',
            'city' => 'Kandy',
            'postal_code' => '20000',
            'country' => 'LK',
            'is_primary' => true,
        ]);

        return CourierShipment::query()->create(array_merge([
            'requested_by_user_id' => $user->id,
            'sender_contact_id' => $sender->id,
            'recipient_contact_id' => $recipient->id,
            'sender_address_id' => $senderAddress->id,
            'recipient_address_id' => $recipientAddress->id,
            'service_level' => 'standard',
            'status' => CourierShipment::STATUS_PENDING,
            'assignment_category' => 'domestic',
            'assignment_status' => CourierShipment::ASSIGNMENT_STATUS_UNASSIGNED,
            'currency_code' => 'LKR',
            'declared_value' => 1000,
        ], $overrides));
    }
}
