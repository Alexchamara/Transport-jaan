<?php

namespace Tests\Unit\Courier;

use App\Models\Courier\CourierAddress;
use App\Models\Courier\CourierContact;
use App\Models\Courier\CourierLabelSize;
use App\Models\Courier\CourierLabelTemplate;
use App\Models\Courier\CourierPackage;
use App\Models\Courier\CourierShipment;
use App\Models\User;
use App\Services\Courier\CourierPodLabelService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class CourierPodLabelServiceTest extends TestCase
{
    use DatabaseTransactions;

    public function test_build_payload_contains_required_pod_fields_and_codes(): void
    {
        $service = app(CourierPodLabelService::class);

        $vendor = User::factory()->create(['role' => 'vendor', 'status' => 'verified']);

        $sender = CourierContact::query()->create([
            'user_id' => $vendor->id,
            'role' => CourierContact::ROLE_SENDER,
            'name' => 'Sender Name',
            'phone' => '+94 11 123 4567',
        ]);

        $recipient = CourierContact::query()->create([
            'user_id' => $vendor->id,
            'role' => CourierContact::ROLE_RECIPIENT,
            'name' => 'Recipient Name',
            'phone' => '+94 77 123 4567',
        ]);

        $senderAddress = CourierAddress::query()->create([
            'contact_id' => $sender->id,
            'line1' => 'Sender Address',
            'city' => 'Colombo',
            'country' => 'LK',
            'is_primary' => true,
        ]);

        $recipientAddress = CourierAddress::query()->create([
            'contact_id' => $recipient->id,
            'line1' => 'Recipient Address',
            'city' => 'Kandy',
            'country' => 'LK',
            'is_primary' => true,
        ]);

        $shipment = CourierShipment::query()->create([
            'reference' => 'CR-TST001',
            'requested_by_user_id' => $vendor->id,
            'assigned_vendor_user_id' => $vendor->id,
            'sender_contact_id' => $sender->id,
            'recipient_contact_id' => $recipient->id,
            'sender_address_id' => $senderAddress->id,
            'recipient_address_id' => $recipientAddress->id,
            'service_level' => 'express',
            'status' => CourierShipment::STATUS_CONFIRMED,
            'order_number' => 'ORD-1001',
            'destination_district' => 'Colombo',
            'destination_nearest_city' => 'Pita Kotte',
            'recipient_nic' => '901234567V',
            'is_cod_enabled' => true,
            'cod_requested_amount' => 1450,
            'currency_code' => 'LKR',
        ]);

        $package = CourierPackage::query()->create([
            'shipment_id' => $shipment->id,
            'weight_kg' => 2.5,
            'description' => 'Documents',
            'quantity' => 1,
        ]);

        $shipment->load(['sender', 'recipient', 'senderAddress', 'recipientAddress']);
        $payload = $service->buildPayload($shipment, $package, $vendor->id);

        $this->assertSame('ORD-1001', $payload['orderNumber']);
        $this->assertSame('Colombo', $payload['district']);
        $this->assertSame('Pita Kotte', $payload['nearestCity']);
        $this->assertSame('901234567V', $payload['recipient']['nic']);
        $this->assertNotEmpty($payload['qrCode']);
        $this->assertNotEmpty($payload['code128Svg']);
        $this->assertStringContainsString('data:image', $payload['qrCode']);
        $this->assertStringContainsString('data:image/svg+xml;base64,', $payload['code128Svg']);
    }

    public function test_two_up_renderer_outputs_pdf_binary(): void
    {
        $service = app(CourierPodLabelService::class);

        $size = new CourierLabelSize([
            'name' => '4x6',
            'width_mm' => 101.6,
            'height_mm' => 152.4,
            'is_active' => true,
            'is_system' => true,
        ]);

        $template = new CourierLabelTemplate([
            'name' => 'POD Layout',
            'category_scope' => 'all',
            'layout_preset' => 'pod_two_up_continuous',
            'orientation' => 'portrait',
            'schema' => $service->defaultTemplateSchema(),
        ]);

        $payload = [
            'reference' => 'CR-TEST',
            'trackingNumber' => 'TRK-TEST',
            'orderNumber' => 'ORD-TEST',
            'issuedDate' => now()->format('Y-m-d'),
            'codAmount' => 1000,
            'currencyCode' => 'LKR',
            'weightKg' => 2.3,
            'district' => 'Colombo',
            'nearestCity' => 'Pita Kotte',
            'description' => 'Docs',
            'sender' => ['name' => 'Sender', 'phone' => '077', 'address' => 'A'],
            'recipient' => ['name' => 'Recipient', 'phonePrimary' => '071', 'phoneSecondary' => '', 'address' => 'B', 'nic' => '9012V'],
            'pod' => ['receiverName' => '', 'receiverNic' => '', 'date' => '', 'signature' => ''],
            'brand' => ['name' => 'Brand', 'address' => 'Addr', 'contactLine' => 'Hotline'],
            'qrCode' => 'data:image/png;base64,' . base64_encode('fakepng'),
            'code128Svg' => 'data:image/svg+xml;base64,' . base64_encode('<svg></svg>'),
        ];

        $html = $service->renderLabelHtml($payload, $template);
        $pdf = $service->renderLabelsPdf([$html], $size, 'portrait');

        $this->assertNotEmpty($pdf);
        $this->assertStringStartsWith('%PDF', $pdf);
    }
}
