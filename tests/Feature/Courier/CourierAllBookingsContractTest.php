<?php

namespace Tests\Feature\Courier;

use App\Models\Courier\CourierAddress;
use App\Models\Courier\CourierContact;
use App\Models\Courier\CourierPackage;
use App\Models\Courier\CourierShipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CourierAllBookingsContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_all_bookings_exposes_canonical_courier_contract_fields(): void
    {
        $user = User::factory()->create([
            'status' => 'verified',
            'role' => 'client',
        ]);

        $sender = CourierContact::query()->create([
            'user_id' => $user->id,
            'role' => CourierContact::ROLE_SENDER,
            'name' => 'Alex Sender',
            'email' => 'alex.sender@example.com',
            'phone' => '+94-77-123-4567',
            'company_name' => 'Sender Co',
        ]);

        $recipient = CourierContact::query()->create([
            'user_id' => $user->id,
            'role' => CourierContact::ROLE_RECIPIENT,
            'name' => 'Riya Recipient',
            'email' => 'riya.recipient@example.com',
            'phone' => '+94-11-555-8888',
            'company_name' => 'Recipient Co',
        ]);

        $senderAddress = CourierAddress::query()->create([
            'contact_id' => $sender->id,
            'line1' => '123 Main Street',
            'line2' => 'Suite 5',
            'city' => 'Colombo',
            'state' => 'Western',
            'postal_code' => '10000',
            'country' => 'LK',
            'instructions' => 'Ring the bell twice',
            'is_primary' => true,
        ]);

        $recipientAddress = CourierAddress::query()->create([
            'contact_id' => $recipient->id,
            'line1' => '987 Lake Road',
            'line2' => 'Level 2',
            'city' => 'Kandy',
            'state' => 'Central',
            'postal_code' => '20000',
            'country' => 'LK',
            'instructions' => 'Leave with reception',
            'is_primary' => true,
        ]);

        $shipment = CourierShipment::query()->create([
            'reference' => 'CR-PHASE3-001',
            'requested_by_user_id' => $user->id,
            'sender_contact_id' => $sender->id,
            'recipient_contact_id' => $recipient->id,
            'sender_address_id' => $senderAddress->id,
            'recipient_address_id' => $recipientAddress->id,
            'service_level' => 'express',
            'status' => CourierShipment::STATUS_CONFIRMED,
            'pickup_date' => now()->addDay()->toDateString(),
            'pickup_window_start' => '09:00:00',
            'pickup_window_end' => '13:00:00',
            'insurance_required' => true,
            'declared_value' => 1250,
            'currency_code' => 'USD',
            'estimated_cost' => 45.75,
            'delivery_notes' => 'Leave at reception',
        ]);

        CourierPackage::query()->create([
            'shipment_id' => $shipment->id,
            'label' => 'Product Samples',
            'package_type' => 'parcel',
            'courier_provider_key' => 'dhl',
            'courier_provider_name' => 'DHL Express',
            'service_tier_key' => 'express',
            'service_tier_label' => 'Express',
            'service_eta' => '1-3 business days',
            'quoted_price_usd' => 45.75,
            'quantity' => 1,
            'weight_kg' => 5.25,
            'length_cm' => 40,
            'width_cm' => 30,
            'height_cm' => 25,
            'declared_value' => 1250,
            'description' => 'Fragile promotional material',
        ]);

        $response = $this->actingAs($user)->get(route('clientAllBookings'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Web/home/client/ClientAllBookings')
            ->has('allBookings', 1)
            ->where('allBookings.0.booking_type', 'courier')
            ->where('allBookings.0.type', 'courier')
            ->where('allBookings.0.reference_number', 'CR-PHASE3-001')
            ->where('allBookings.0.tracking_reference', 'CR-PHASE3-001')
            ->where('allBookings.0.tracking_number', 'CR-PHASE3-001')
            ->where('allBookings.0.pickup_location', 'Colombo, Western, LK')
            ->where('allBookings.0.dropoff_location', 'Kandy, Central, LK')
            ->where('allBookings.0.pickup_address', '123 Main Street, Suite 5 | Colombo, Western, 10000 | LK')
            ->where('allBookings.0.delivery_address', '987 Lake Road, Level 2 | Kandy, Central, 20000 | LK')
            ->where('allBookings.0.sender_name', 'Alex Sender')
            ->where('allBookings.0.sender_email', 'alex.sender@example.com')
            ->where('allBookings.0.sender_phone', '+94-77-123-4567')
            ->where('allBookings.0.recipient_name', 'Riya Recipient')
            ->where('allBookings.0.service_level', 'Express')
            ->where('allBookings.0.package_count', 1)
            ->where('allBookings.0.package_type', 'parcel')
            ->where('allBookings.0.weight', 5.25)
        );
    }
}
