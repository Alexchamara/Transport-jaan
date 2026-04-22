<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\Courier\CourierAddress;
use App\Models\Courier\CourierContact;
use App\Models\Courier\CourierShipment;
use App\Models\Courier\CourierShipmentPayment;
use App\Models\User;
use App\Support\SuperAdminCourierRbac;
use App\Support\SuperAdminCourierWorkspace;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class SuperAdminCourierCodDashboardSupportTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        SuperAdminCourierRbac::ensureDefinitionsExist();
    }

    public function test_courier_reports_expose_cod_payment_method_and_status_without_card_payment_row(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $workspaceId = SuperAdminCourierWorkspace::idForUser($superAdmin);
        app(PermissionRegistrar::class)->setPermissionsTeamId($workspaceId);
        $superAdmin->givePermissionTo('superadmin.courier.reports.view');

        $shipment = $this->createShipment([
            'status' => CourierShipment::STATUS_DELIVERED,
            'is_cod_enabled' => true,
            'cod_requested_amount' => 3500,
            'cod_collected_amount' => 3000,
            'cod_collection_status' => 'partially_collected',
            'cod_collection_recorded_at' => now()->subHour(),
            'estimated_cost' => 3500,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->actingAs($superAdmin)->get(route('superadmin.reports.courier'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Web/home/SuperAdmin/CourierReports')
            ->where('bookings.0.tracking_number', (string) $shipment->reference)
            ->where('bookings.0.payment_method', CourierShipmentPayment::PAYMENT_METHOD_COD)
            ->where('bookings.0.payment_status', CourierShipmentPayment::STATUS_PAID)
            ->where('stats.codPaymentsTotal', 1)
            ->where('stats.codPaymentsPaid', 1)
            ->where('stats.codPaymentsPending', 0)
            ->where('stats.codPaymentsFailed', 0)
        );
    }

    public function test_superadmin_payments_page_includes_unified_courier_payments_with_cod_rows(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $workspaceId = SuperAdminCourierWorkspace::idForUser($superAdmin);
        app(PermissionRegistrar::class)->setPermissionsTeamId($workspaceId);
        $superAdmin->givePermissionTo('superadmin.courier.payments.view');

        $shipment = $this->createShipment([
            'status' => CourierShipment::STATUS_DELIVERED,
            'is_cod_enabled' => true,
            'cod_requested_amount' => 1800,
            'cod_collected_amount' => 1800,
            'cod_collection_status' => 'collected',
            'cod_collection_recorded_at' => now()->subMinutes(20),
            'estimated_cost' => 1800,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->actingAs($superAdmin)->get('/superadmin/payments');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Web/home/SuperAdmin/Payments')
            ->where('courierPayments.0.shipment_reference', (string) $shipment->reference)
            ->where('courierPayments.0.method', CourierShipmentPayment::PAYMENT_METHOD_COD)
            ->where('courierPayments.0.status', CourierShipmentPayment::STATUS_PAID)
            ->where('courierPayments.0.cod_collection_status', 'collected')
            ->where('courierCardPayments', [])
        );
    }

    private function createShipment(array $overrides = []): CourierShipment
    {
        $sender = CourierContact::query()->create([
            'name' => 'SA Sender',
            'email' => 'sa-sender+' . uniqid() . '@example.com',
        ]);
        $recipient = CourierContact::query()->create([
            'name' => 'SA Recipient',
            'email' => 'sa-recipient+' . uniqid() . '@example.com',
        ]);

        $senderAddress = CourierAddress::query()->create([
            'contact_id' => $sender->id,
            'line1' => 'Sender line',
            'city' => 'Colombo',
            'country' => 'LK',
        ]);
        $recipientAddress = CourierAddress::query()->create([
            'contact_id' => $recipient->id,
            'line1' => 'Recipient line',
            'city' => 'Kandy',
            'country' => 'LK',
        ]);

        return CourierShipment::query()->create(array_merge([
            'reference' => 'CR-SA-' . strtoupper(substr(sha1((string) microtime(true)), 0, 8)),
            'requested_by_user_id' => User::factory()->create(['role' => 'client', 'status' => 'verified'])->id,
            'sender_contact_id' => $sender->id,
            'recipient_contact_id' => $recipient->id,
            'sender_address_id' => $senderAddress->id,
            'recipient_address_id' => $recipientAddress->id,
            'service_level' => 'express',
            'status' => CourierShipment::STATUS_CONFIRMED,
            'assignment_status' => CourierShipment::ASSIGNMENT_STATUS_ASSIGNED,
            'assignment_category' => 'domestic',
            'assigned_at' => now(),
            'currency_code' => 'LKR',
            'estimated_cost' => 1200,
        ], $overrides));
    }
}
