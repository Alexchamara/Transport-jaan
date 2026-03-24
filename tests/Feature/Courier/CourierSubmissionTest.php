<?php

namespace Tests\Feature\Courier;

use App\Models\Courier\CourierShipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourierSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_courier_create_route(): void
    {
        $this->get(route('couriers.create'))
            ->assertRedirect(route('login'));
    }

    public function test_client_can_submit_courier_request_and_download_bill(): void
    {
        $user = User::factory()->create();

        $payload = $this->validSubmissionPayload();

        $csrfToken = 'test-token';

        $this->actingAs($user)
            ->withSession(['_token' => $csrfToken])
            ->post(route('couriers.store'), $payload + ['_token' => $csrfToken])
            ->assertRedirect(route('couriers.create'))
            ->assertSessionHas('success')
            ->assertSessionHas('courier_reference')
            ->assertSessionHas('courier_bill_id');

        $shipment = CourierShipment::with('packages')->first();
        $this->assertNotNull($shipment);

        $this->actingAs($user)
            ->get(route('couriers.bill', $shipment))
            ->assertOk()
            ->assertHeader('Content-Disposition', 'attachment; filename="courier-bill-' . $shipment->reference . '.html"')
            ->assertSee('Courier Service Bill')
            ->assertSee('Sender details')
            ->assertSee('Recipient details')
            ->assertSee('Shipment preferences')
            ->assertSee('Package details');
    }

    public function test_non_owner_cannot_download_courier_bill(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $payload = $this->validSubmissionPayload();
        $csrfToken = 'test-token-owner-only';

        $this->actingAs($owner)
            ->withSession(['_token' => $csrfToken])
            ->post(route('couriers.store'), $payload + ['_token' => $csrfToken])
            ->assertRedirect(route('couriers.create'));

        $shipment = CourierShipment::query()->latest('id')->first();
        $this->assertNotNull($shipment);

        $this->actingAs($otherUser)
            ->get(route('couriers.bill', $shipment))
            ->assertForbidden();
    }

    private function validSubmissionPayload(): array
    {
        return [
            'sender' => [
                'name' => 'Alex Sender',
                'email' => 'alex.sender@example.com',
                'phone' => '+94-77-123-4567',
                'company' => 'Sender Co',
                'address' => [
                    'line1' => '123 Main Street',
                    'line2' => 'Suite 5',
                    'city' => 'Colombo',
                    'state' => 'Western',
                    'postalCode' => '10000',
                    'country' => 'LK',
                    'instructions' => 'Ring the bell twice',
                ],
            ],
            'recipient' => [
                'name' => 'Riya Recipient',
                'email' => 'riya.recipient@example.com',
                'phone' => '+94-11-555-8888',
                'company' => 'Recipient Co',
                'address' => [
                    'line1' => '987 Lake Road',
                    'line2' => 'Level 2',
                    'city' => 'Kandy',
                    'state' => 'Central',
                    'postalCode' => '20000',
                    'country' => 'LK',
                    'instructions' => 'Leave with reception',
                ],
            ],
            'shipment' => [
                'pickupDate' => now()->addDay()->toDateString(),
                'pickupWindowStart' => '09:00',
                'pickupWindowEnd' => '13:00',
                'serviceLevel' => 'Express',
                'currency' => 'LKR',
                'insurance' => true,
                'deliveryNotes' => 'Leave at reception',
                'estimatedValue' => 1250,
            ],
            'packages' => [
                [
                    'label' => 'Product Samples',
                    'packageType' => 'parcel',
                    'courierProvider' => 'dhl',
                    'serviceLevel' => 'express',
                    'quantity' => 1,
                    'weightKg' => 5.25,
                    'lengthCm' => 40,
                    'widthCm' => 30,
                    'heightCm' => 25,
                    'declaredValue' => 1250,
                    'description' => 'Fragile promotional material',
                ],
            ],
            'reviewContext' => [
                'displayCurrency' => 'LKR',
                'totalPriceUSD' => 45.75,
                'selectedQuotes' => [
                    [
                        'packageIndex' => 0,
                        'providerId' => 'dhl',
                        'providerName' => 'DHL Express',
                        'serviceLevel' => 'express',
                        'serviceLabel' => 'Express',
                        'eta' => '1-3 business days',
                        'description' => 'Balanced speed for most time-sensitive shipments.',
                        'priceUSD' => 45.75,
                        'weight' => 5.25,
                        'billableWeight' => 5.25,
                    ],
                ],
            ],
        ];
    }
}
