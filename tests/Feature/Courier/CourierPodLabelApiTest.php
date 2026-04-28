<?php

namespace Tests\Feature\Courier;

use App\Models\Courier\CourierAddress;
use App\Models\Courier\CourierContact;
use App\Models\Courier\CourierLabelPrintJob;
use App\Models\Courier\CourierLabelSize;
use App\Models\Courier\CourierLabelTemplate;
use App\Models\Courier\CourierPackage;
use App\Models\Courier\CourierShipment;
use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;
use App\Models\User;
use App\Models\VendorServiceRegistration;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class CourierPodLabelApiTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->withoutMiddleware();
    }

    public function test_template_crud_requires_vendor_ownership(): void
    {
        $vendorA = $this->createApprovedCourierVendor();
        $vendorB = $this->createApprovedCourierVendor();

        $size = CourierLabelSize::query()->create([
            'vendor_user_id' => $vendorA->id,
            'name' => '4x6',
            'width_mm' => 101.6,
            'height_mm' => 152.4,
            'is_active' => true,
            'is_system' => false,
        ]);

        $template = CourierLabelTemplate::query()->create([
            'vendor_user_id' => $vendorA->id,
            'size_id' => $size->id,
            'name' => 'POD Default',
            'category_scope' => 'all',
            'layout_preset' => 'pod_two_up_continuous',
            'orientation' => 'portrait',
            'version' => 1,
            'schema' => ['showCodAmount' => true],
            'is_active' => true,
            'is_system' => false,
        ]);

        $response = $this->actingAs($vendorB)->patchJson(
            route('courierService.labels.templates.update', ['template' => $template->id]),
            [
                'name' => 'Hijack Attempt',
                'categoryScope' => 'all',
                'orientation' => 'portrait',
                'schema' => ['showCodAmount' => false],
            ]
        );

        $response->assertNotFound();

        $template->refresh();
        $this->assertSame('POD Default', $template->name);
    }

    public function test_store_job_returns_ready_for_small_batch(): void
    {
        $vendor = $this->createApprovedCourierVendor();

        [$shipment, $package] = $this->createShipmentWithPackage($vendor, CourierShipment::STATUS_CONFIRMED);

        $size = CourierLabelSize::query()->create([
            'vendor_user_id' => $vendor->id,
            'name' => '4x6',
            'width_mm' => 101.6,
            'height_mm' => 152.4,
            'is_active' => true,
            'is_system' => false,
        ]);

        $template = CourierLabelTemplate::query()->create([
            'vendor_user_id' => $vendor->id,
            'size_id' => $size->id,
            'name' => 'POD Template',
            'category_scope' => 'all',
            'layout_preset' => 'pod_two_up_continuous',
            'orientation' => 'portrait',
            'version' => 1,
            'schema' => ['showCodAmount' => true],
            'is_active' => true,
            'is_system' => false,
        ]);

        $response = $this->actingAs($vendor)->postJson(route('courierService.labels.jobs.store'), [
            'shipmentIds' => [$shipment->id],
            'packageIds' => [$package->id],
            'templateId' => $template->id,
            'sizeId' => $size->id,
        ]);

        $response->assertOk();
        $response->assertJsonPath('status', 'ready');
        $response->assertJsonStructure(['jobId', 'url']);

        $job = CourierLabelPrintJob::query()->findOrFail((int) $response->json('jobId'));
        $this->assertSame('generated', $job->status);
    }

    public function test_store_job_queues_for_large_batch_and_rejects_hard_limit(): void
    {
        Queue::fake();

        $vendor = $this->createApprovedCourierVendor();

        $size = CourierLabelSize::query()->create([
            'vendor_user_id' => $vendor->id,
            'name' => '4x6',
            'width_mm' => 101.6,
            'height_mm' => 152.4,
            'is_active' => true,
            'is_system' => false,
        ]);

        $template = CourierLabelTemplate::query()->create([
            'vendor_user_id' => $vendor->id,
            'size_id' => $size->id,
            'name' => 'Bulk POD Template',
            'category_scope' => 'all',
            'layout_preset' => 'pod_two_up_continuous',
            'orientation' => 'portrait',
            'version' => 1,
            'schema' => ['showCodAmount' => true],
            'is_active' => true,
            'is_system' => false,
        ]);

        $shipmentIds = [];
        for ($i = 0; $i < 26; $i++) {
            [$shipment] = $this->createShipmentWithPackage($vendor, CourierShipment::STATUS_CONFIRMED);
            $shipmentIds[] = $shipment->id;
        }

        $queued = $this->actingAs($vendor)->postJson(route('courierService.labels.jobs.store'), [
            'shipmentIds' => $shipmentIds,
            'templateId' => $template->id,
            'sizeId' => $size->id,
        ]);

        $queued->assertStatus(202);
        $queued->assertJsonPath('status', 'queued');

        $tooMany = [];
        for ($i = 0; $i < 501; $i++) {
            [$shipment] = $this->createShipmentWithPackage($vendor, CourierShipment::STATUS_CONFIRMED);
            $tooMany[] = $shipment->id;
        }

        $rejected = $this->actingAs($vendor)->postJson(route('courierService.labels.jobs.store'), [
            'shipmentIds' => $tooMany,
            'templateId' => $template->id,
            'sizeId' => $size->id,
        ]);

        $rejected->assertStatus(422);
        $rejected->assertJsonPath('message', 'Print request exceeds hard limit of 500 labels.');
    }

    private function createApprovedCourierVendor(): User
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

        return $vendor;
    }

    private function createShipmentWithPackage(User $vendor, string $status): array
    {
        $sender = CourierContact::query()->create([
            'user_id' => $vendor->id,
            'role' => CourierContact::ROLE_SENDER,
            'name' => 'Sender ' . uniqid('', false),
            'phone' => '+94 11 123 4567',
        ]);

        $recipient = CourierContact::query()->create([
            'user_id' => $vendor->id,
            'role' => CourierContact::ROLE_RECIPIENT,
            'name' => 'Recipient ' . uniqid('', false),
            'phone' => '+94 77 123 4567',
        ]);

        $senderAddress = CourierAddress::query()->create([
            'contact_id' => $sender->id,
            'line1' => 'No 1, Sender Road',
            'city' => 'Colombo',
            'country' => 'LK',
            'is_primary' => true,
        ]);

        $recipientAddress = CourierAddress::query()->create([
            'contact_id' => $recipient->id,
            'line1' => 'No 2, Recipient Road',
            'city' => 'Kandy',
            'country' => 'LK',
            'is_primary' => true,
        ]);

        $shipment = CourierShipment::query()->create([
            'requested_by_user_id' => $vendor->id,
            'assigned_vendor_user_id' => $vendor->id,
            'sender_contact_id' => $sender->id,
            'recipient_contact_id' => $recipient->id,
            'sender_address_id' => $senderAddress->id,
            'recipient_address_id' => $recipientAddress->id,
            'status' => $status,
            'service_level' => 'express',
            'currency_code' => 'LKR',
            'order_number' => 'ORD-' . uniqid('', false),
            'destination_district' => 'Colombo',
            'destination_nearest_city' => 'Pita Kotte',
        ]);

        $package = CourierPackage::query()->create([
            'shipment_id' => $shipment->id,
            'package_type' => 'parcel',
            'quantity' => 1,
            'weight_kg' => 2.3,
            'description' => 'Sample package',
        ]);

        return [$shipment, $package];
    }
}
