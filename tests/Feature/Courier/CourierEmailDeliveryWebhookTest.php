<?php

namespace Tests\Feature\Courier;

use App\Models\Courier\CourierAddress;
use App\Models\Courier\CourierContact;
use App\Models\Courier\CourierCustomerEmailDispatch;
use App\Models\Courier\CourierEmailSuppression;
use App\Models\Courier\CourierShipment;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Str;
use Tests\TestCase;

class CourierEmailDeliveryWebhookTest extends TestCase
{
    use DatabaseTransactions;

    public function test_delivery_webhook_marks_dispatch_and_records_suppression(): void
    {
        config()->set('courier.notifications_v2.delivery_webhook_secret', 'test-webhook-secret');

        $vendor = User::factory()->create();
        $requester = User::factory()->create([
            'email' => 'requester+' . Str::lower(Str::random(6)) . '@example.com',
        ]);
        $shipment = $this->createShipment($requester, (int) $vendor->id);

        $dispatch = CourierCustomerEmailDispatch::query()->create([
            'shipment_id' => (int) $shipment->id,
            'vendor_user_id' => (int) $vendor->id,
            'event_type' => 'shipment_placed',
            'channel' => 'email',
            'recipient_email' => mb_strtolower((string) $requester->email),
            'recipient_kind' => 'requester',
            'status' => CourierCustomerEmailDispatch::STATUS_SENT,
            'dedupe_key' => sha1('webhook-test-' . Str::random(8)),
            'queued_at' => now(),
            'sent_at' => now(),
        ]);

        $response = $this->postJson('/webhooks/email/delivery', [
            'dispatch_id' => (int) $dispatch->id,
            'event' => 'hard_bounce',
            'email' => mb_strtolower((string) $requester->email),
            'reason_code' => 'mailbox_not_found',
            'message_id' => 'provider-message-1',
        ], [
            'X-Courier-Webhook-Secret' => 'test-webhook-secret',
        ]);

        $response->assertOk()
            ->assertJson([
                'ok' => true,
                'suppressed' => true,
                'event' => 'hard_bounce',
            ]);

        $dispatch->refresh();
        $this->assertSame(CourierCustomerEmailDispatch::STATUS_FAILED, (string) $dispatch->status);
        $this->assertSame('hard_bounce', (string) $dispatch->provider_event);
        $this->assertSame('mailbox_not_found', (string) $dispatch->failed_reason_code);
        $this->assertSame('provider-message-1', (string) $dispatch->provider_message_id);

        $this->assertDatabaseHas('courier_email_suppressions', [
            'vendor_user_id' => (int) $vendor->id,
            'email' => mb_strtolower((string) $requester->email),
            'provider_event' => 'hard_bounce',
        ]);
    }

    private function createShipment(User $requester, int $vendorId): CourierShipment
    {
        $sender = CourierContact::query()->create([
            'user_id' => (int) $requester->id,
            'role' => CourierContact::ROLE_SENDER,
            'name' => 'Sender ' . Str::random(5),
            'email' => 'sender+' . Str::lower(Str::random(6)) . '@example.com',
            'phone' => '+94-77-100-1000',
        ]);

        $recipient = CourierContact::query()->create([
            'user_id' => (int) $requester->id,
            'role' => CourierContact::ROLE_RECIPIENT,
            'name' => 'Recipient ' . Str::random(5),
            'email' => 'recipient+' . Str::lower(Str::random(6)) . '@example.com',
            'phone' => '+94-11-200-2000',
        ]);

        $senderAddress = CourierAddress::query()->create([
            'contact_id' => (int) $sender->id,
            'label' => 'pickup',
            'line1' => '12 Palm Street',
            'city' => 'Colombo',
            'state' => 'Western',
            'postal_code' => '10000',
            'country' => 'LK',
            'is_primary' => true,
        ]);

        $recipientAddress = CourierAddress::query()->create([
            'contact_id' => (int) $recipient->id,
            'label' => 'dropoff',
            'line1' => '42 Market Avenue',
            'city' => 'Kandy',
            'state' => 'Central',
            'postal_code' => '20000',
            'country' => 'LK',
            'is_primary' => true,
        ]);

        return CourierShipment::query()->create([
            'reference' => 'CR-WH-' . strtoupper(Str::random(6)),
            'requested_by_user_id' => (int) $requester->id,
            'assigned_vendor_user_id' => $vendorId,
            'sender_contact_id' => (int) $sender->id,
            'recipient_contact_id' => (int) $recipient->id,
            'sender_address_id' => (int) $senderAddress->id,
            'recipient_address_id' => (int) $recipientAddress->id,
            'service_level' => 'express',
            'status' => CourierShipment::STATUS_PENDING,
            'pickup_date' => now()->addDay()->toDateString(),
            'pickup_window_start' => '09:00:00',
            'pickup_window_end' => '12:00:00',
            'currency_code' => 'LKR',
        ]);
    }
}

