<?php

namespace Tests\Feature\SuperAdmin;

use App\Http\Middleware\VerifyCsrfToken;
use App\Models\Courier\CourierAddress;
use App\Models\Courier\CourierCodSettlementBatch;
use App\Models\Courier\CourierCodSettlementLine;
use App\Models\Courier\CourierContact;
use App\Models\Courier\CourierShipment;
use App\Models\User;
use App\Support\SuperAdminCourierRbac;
use App\Support\SuperAdminCourierWorkspace;
use Carbon\Carbon;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class SuperAdminCourierCodSettlementReconciliationTest extends TestCase
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

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_superadmin_can_generate_cod_settlement_batch_with_reconciliation_lines(): void
    {
        if (!Schema::hasTable('courier_cod_settlement_batches') || !Schema::hasTable('courier_cod_settlement_lines')) {
            $this->markTestSkipped('Settlement batch tables are not available. Run migrations before this suite.');
        }

        Carbon::setTestNow(Carbon::create(2026, 4, 10, 10, 0, 0, 'UTC'));

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $this->grantSuperAdminPermissions($superAdmin, [
            'superadmin.courier.cod.settings.view',
            'superadmin.courier.cod.settlement.batch.manage',
        ]);

        $requester = User::factory()->create(['role' => 'client']);
        $vendor = User::factory()->create(['role' => 'vendor', 'status' => 'verified']);

        $this->createDeliveredCodShipment($requester, $vendor, [
            'reference' => 'CR-TSET-0001',
            'cod_requested_amount' => 1500,
            'cod_collected_amount' => 1500,
            'cod_collection_status' => 'collected',
            'cod_collection_recorded_at' => now()->subDay(),
        ]);

        $this->createDeliveredCodShipment($requester, $vendor, [
            'reference' => 'CR-TSET-0002',
            'cod_requested_amount' => 2200,
            'cod_collected_amount' => 1700,
            'cod_collection_status' => 'partially_collected',
            'cod_collection_recorded_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($superAdmin)
            ->post(route('superadmin.settings.cod-settlement.batches.generate'), [
                'fromDate' => now()->subDays(2)->toDateString(),
                'toDate' => now()->toDateString(),
                'category' => 'domestic',
                'note' => 'Test generation run',
            ]);

        $response->assertRedirect();

        $batch = CourierCodSettlementBatch::query()->latest('id')->first();
        $this->assertNotNull($batch);
        $this->assertSame('domestic', (string) $batch->category);
        $this->assertSame(2, (int) $batch->shipment_count);
        $this->assertSame(CourierCodSettlementBatch::STATUS_RECONCILING, (string) $batch->status);
        $this->assertSame(CourierCodSettlementBatch::RECON_STATUS_ISSUES_DETECTED, (string) $batch->reconciliation_status);

        $lines = CourierCodSettlementLine::query()
            ->where('courier_cod_settlement_batch_id', $batch->id)
            ->orderBy('id')
            ->get();

        $this->assertCount(2, $lines);
        $this->assertTrue($lines->contains(fn (CourierCodSettlementLine $line) => (string) $line->line_status === CourierCodSettlementLine::STATUS_PENDING_RECONCILIATION));
        $this->assertTrue($lines->contains(fn (CourierCodSettlementLine $line) => (string) $line->line_status === CourierCodSettlementLine::STATUS_PAYOUT_READY));
    }

    public function test_superadmin_can_open_and_resolve_cod_settlement_dispute_line(): void
    {
        if (!Schema::hasTable('courier_cod_settlement_batches') || !Schema::hasTable('courier_cod_settlement_lines')) {
            $this->markTestSkipped('Settlement batch tables are not available. Run migrations before this suite.');
        }

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $this->grantSuperAdminPermissions($superAdmin, [
            'superadmin.courier.cod.settings.view',
            'superadmin.courier.cod.settlement.dispute.manage',
        ]);

        $vendor = User::factory()->create(['role' => 'vendor', 'status' => 'verified']);
        $batch = $this->createSettlementBatch(CourierCodSettlementBatch::STATUS_RECONCILING);

        $line = CourierCodSettlementLine::query()->create([
            'courier_cod_settlement_batch_id' => $batch->id,
            'shipment_id' => $this->createDeliveredCodShipment(User::factory()->create(['role' => 'client']), $vendor, [
                'reference' => 'CR-TSET-1001',
                'cod_requested_amount' => 1200,
                'cod_collected_amount' => 900,
                'cod_collection_status' => 'partially_collected',
                'cod_collection_recorded_at' => now()->subHours(10),
            ])->id,
            'vendor_user_id' => $vendor->id,
            'line_status' => CourierCodSettlementLine::STATUS_PENDING_RECONCILIATION,
            'currency_code' => 'LKR',
            'requested_cod_amount' => 1200,
            'collected_cod_amount' => 900,
            'reserve_amount' => 22.5,
            'payout_amount' => 877.5,
            'discrepancy_amount' => 300,
        ]);

        $this->actingAs($superAdmin)
            ->post(route('superadmin.settings.cod-settlement.lines.dispute', ['line' => $line->id]), [
                'reason' => 'Collection mismatch pending driver clarification.',
                'note' => 'Opened from test',
            ])
            ->assertRedirect();

        $line->refresh();
        $batch->refresh();

        $this->assertSame(CourierCodSettlementLine::STATUS_DISPUTED, (string) $line->line_status);
        $this->assertSame(CourierCodSettlementLine::DISPUTE_STATUS_OPEN, (string) $line->dispute_status);
        $this->assertSame(CourierCodSettlementBatch::RECON_STATUS_DISPUTE_OPEN, (string) $batch->reconciliation_status);

        $this->actingAs($superAdmin)
            ->post(route('superadmin.settings.cod-settlement.lines.resolve', ['line' => $line->id]), [
                'resolution' => 'payout_ready',
                'collectedAmount' => 1200,
                'note' => 'Proof verified, releasing payout.',
            ])
            ->assertRedirect();

        $line->refresh();
        $batch->refresh();

        $this->assertSame(CourierCodSettlementLine::STATUS_PAYOUT_READY, (string) $line->line_status);
        $this->assertSame(CourierCodSettlementLine::DISPUTE_STATUS_RESOLVED, (string) $line->dispute_status);
        $this->assertSame(CourierCodSettlementBatch::STATUS_READY_FOR_PAYOUT, (string) $batch->status);
        $this->assertSame(CourierCodSettlementBatch::RECON_STATUS_BALANCED, (string) $batch->reconciliation_status);
    }

    public function test_superadmin_can_export_payout_ready_settlement_batch_and_mark_as_exported(): void
    {
        if (!Schema::hasTable('courier_cod_settlement_batches') || !Schema::hasTable('courier_cod_settlement_lines')) {
            $this->markTestSkipped('Settlement batch tables are not available. Run migrations before this suite.');
        }

        $superAdmin = User::factory()->create([
            'role' => 'SuperAdmin',
        ]);

        $this->grantSuperAdminPermissions($superAdmin, [
            'superadmin.courier.cod.settings.view',
            'superadmin.courier.cod.settlement.export',
        ]);

        $vendor = User::factory()->create(['role' => 'vendor', 'status' => 'verified']);
        $shipment = $this->createDeliveredCodShipment(User::factory()->create(['role' => 'client']), $vendor, [
            'reference' => 'CR-TSET-2001',
            'cod_requested_amount' => 1000,
            'cod_collected_amount' => 1000,
            'cod_collection_status' => 'collected',
            'cod_collection_recorded_at' => now()->subHours(4),
        ]);

        $batch = $this->createSettlementBatch(CourierCodSettlementBatch::STATUS_READY_FOR_PAYOUT);

        CourierCodSettlementLine::query()->create([
            'courier_cod_settlement_batch_id' => $batch->id,
            'shipment_id' => $shipment->id,
            'vendor_user_id' => $vendor->id,
            'line_status' => CourierCodSettlementLine::STATUS_PAYOUT_READY,
            'currency_code' => 'LKR',
            'requested_cod_amount' => 1000,
            'collected_cod_amount' => 1000,
            'reserve_amount' => 25,
            'payout_amount' => 975,
            'discrepancy_amount' => 0,
        ]);

        $batch->update([
            'shipment_count' => 1,
            'gross_cod_amount' => 1000,
            'reserve_amount' => 25,
            'net_payout_amount' => 975,
            'discrepancy_amount' => 0,
            'reconciliation_status' => CourierCodSettlementBatch::RECON_STATUS_BALANCED,
        ]);

        $response = $this->actingAs($superAdmin)
            ->get(route('superadmin.settings.cod-settlement.batches.export', ['batch' => $batch->id]));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Batch Reference', (string) $response->streamedContent());

        $batch->refresh();
        $this->assertSame(CourierCodSettlementBatch::STATUS_EXPORTED, (string) $batch->status);
        $this->assertNotNull($batch->exported_at);
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
    private function createDeliveredCodShipment(User $client, User $vendor, array $overrides = []): CourierShipment
    {
        $sender = CourierContact::query()->create([
            'user_id' => $client->id,
            'role' => CourierContact::ROLE_SENDER,
            'name' => 'Sender Test',
            'email' => 'sender+' . uniqid() . '@example.com',
            'phone' => '+94112223344',
        ]);

        $recipient = CourierContact::query()->create([
            'user_id' => $client->id,
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
            'reference' => 'CR-SET-' . strtoupper(substr(md5((string) microtime(true) . (string) random_int(10, 9999)), 0, 8)),
            'requested_by_user_id' => $client->id,
            'assigned_vendor_user_id' => $vendor->id,
            'sender_contact_id' => $sender->id,
            'recipient_contact_id' => $recipient->id,
            'sender_address_id' => $senderAddress->id,
            'recipient_address_id' => $recipientAddress->id,
            'service_level' => 'standard',
            'status' => CourierShipment::STATUS_DELIVERED,
            'assignment_category' => 'domestic',
            'assignment_status' => CourierShipment::ASSIGNMENT_STATUS_ASSIGNED,
            'assigned_at' => now()->subDays(2),
            'declared_value' => 1000,
            'currency_code' => 'LKR',
            'is_cod_enabled' => true,
            'cod_requested_amount' => 1000,
            'cod_collection_status' => 'collected',
            'cod_collected_amount' => 1000,
            'cod_collection_recorded_at' => now()->subDay(),
        ], $overrides));
    }

    private function createSettlementBatch(string $status): CourierCodSettlementBatch
    {
        return CourierCodSettlementBatch::query()->create([
            'batch_reference' => CourierCodSettlementBatch::generateReference(),
            'category' => CourierCodSettlementBatch::CATEGORY_DOMESTIC,
            'status' => $status,
            'reconciliation_status' => CourierCodSettlementBatch::RECON_STATUS_ISSUES_DETECTED,
            'currency_code' => 'LKR',
            'cycle_start_date' => now()->subDays(7)->toDateString(),
            'cycle_end_date' => now()->toDateString(),
            'shipment_count' => 0,
            'gross_cod_amount' => 0,
            'reserve_amount' => 0,
            'net_payout_amount' => 0,
            'discrepancy_amount' => 0,
            'generated_at' => now(),
            'metadata' => [],
        ]);
    }
}
