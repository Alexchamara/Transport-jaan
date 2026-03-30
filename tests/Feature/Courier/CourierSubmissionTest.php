<?php

namespace Tests\Feature\Courier;

use App\Models\Courier\CourierShipment;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class CourierSubmissionTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow(Carbon::create(2026, 3, 30, 10, 0, 0, 'UTC'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

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
            ->withSession(['_token' => $csrfToken, 'courier_preview' => $payload])
            ->post(route('couriers.store'), $payload + ['_token' => $csrfToken])
            ->assertRedirect(route('couriers.create'))
            ->assertSessionHas('success')
            ->assertSessionHas('courier_reference')
            ->assertSessionHas('courier_bill_id');

        $shipment = CourierShipment::with('packages')
            ->where('requested_by_user_id', $user->id)
            ->latest('id')
            ->first();
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
            ->withSession(['_token' => $csrfToken, 'courier_preview' => $payload])
            ->post(route('couriers.store'), $payload + ['_token' => $csrfToken])
            ->assertRedirect(route('couriers.create'));

        $shipment = CourierShipment::query()
            ->where('requested_by_user_id', $owner->id)
            ->latest('id')
            ->first();
        $this->assertNotNull($shipment);

        $this->actingAs($otherUser)
            ->get(route('couriers.bill', $shipment))
            ->assertForbidden();
    }

    public function test_non_owner_cannot_view_shipment_detail_page(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $shipment = $this->createShipmentForUser($owner);

        $this->actingAs($otherUser)
            ->get(route('courier.shipment.show', ['id' => $shipment->id]))
            ->assertNotFound();
    }

    public function test_repeated_unauthorized_bill_download_attempts_trigger_alert_log(): void
    {
        Cache::flush();
        Log::spy();

        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $shipment = $this->createShipmentForUser($owner);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->actingAs($otherUser)
                ->get(route('couriers.bill', $shipment))
                ->assertForbidden();
        }

        Log::shouldHaveReceived('error')
            ->withArgs(function ($message, $context) use ($shipment, $otherUser) {
                return $message === 'COURIER CLIENT REPEATED AUTHORIZATION DENIALS'
                    && ($context['reason'] ?? null) === 'ownership_failure'
                    && (int) ($context['actor_user_id'] ?? 0) === (int) $otherUser->id
                    && (int) ($context['resource_id'] ?? 0) === (int) $shipment->id;
            })
            ->once();
    }

    public function test_store_redirects_to_create_when_preview_session_missing(): void
    {
        $user = User::factory()->create();
        $payload = $this->validSubmissionPayload();
        $csrfToken = 'test-token-no-preview';

        $this->actingAs($user)
            ->withSession(['_token' => $csrfToken])
            ->post(route('couriers.store'), $payload + ['_token' => $csrfToken])
            ->assertRedirect(route('couriers.create'))
            ->assertSessionHas('error');

        $this->assertSame(0, CourierShipment::query()->where('requested_by_user_id', $user->id)->count());
    }

    public function test_store_redirects_to_summary_when_payload_is_tampered_after_review(): void
    {
        $user = User::factory()->create();
        $previewPayload = $this->validSubmissionPayload();
        $tamperedPayload = $this->validSubmissionPayload();
        $tamperedPayload['shipment']['serviceLevel'] = 'Economy';
        $csrfToken = 'test-token-tampered-preview';

        $this->actingAs($user)
            ->withSession(['_token' => $csrfToken, 'courier_preview' => $previewPayload])
            ->post(route('couriers.store'), $tamperedPayload + ['_token' => $csrfToken])
            ->assertRedirect(route('couriers.summary'))
            ->assertSessionHas('error');

        $this->assertSame(0, CourierShipment::query()->where('requested_by_user_id', $user->id)->count());
    }

    public function test_details_redirects_to_create_when_preview_session_missing(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('couriers.details'))
            ->assertRedirect(route('couriers.create'))
            ->assertSessionHas('error');
    }

    public function test_details_store_redirects_to_create_when_preview_session_is_corrupt(): void
    {
        $user = User::factory()->create();
        $csrfToken = 'test-token-details-corrupt';

        $this->actingAs($user)
            ->withSession([
                '_token' => $csrfToken,
                'courier_preview' => [
                    'sender' => ['name' => 'Sender Only'],
                ],
            ])
            ->post(route('couriers.details.store'), ['_token' => $csrfToken])
            ->assertRedirect(route('couriers.create'))
            ->assertSessionHas('error');
    }

    public function test_summary_redirects_to_create_when_preview_session_is_corrupt(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession([
                'courier_preview' => [
                    'sender' => [
                        'name' => 'Alex Sender',
                        'address' => ['line1' => '123 Main Street'],
                    ],
                ],
            ])
            ->get(route('couriers.summary'))
            ->assertRedirect(route('couriers.create'))
            ->assertSessionHas('error');
    }

    public function test_update_status_rejects_invalid_transition_to_delivered_from_pending(): void
    {
        $user = User::factory()->create();
        $shipment = $this->createShipmentForUser($user);
        $csrfToken = 'test-token-invalid-transition';

        $this->actingAs($user)
            ->withSession(['_token' => $csrfToken])
            ->post(route('courier.shipment.updateStatus', ['id' => $shipment->id]), [
                '_token' => $csrfToken,
                'status' => CourierShipment::STATUS_DELIVERED,
            ])
            ->assertStatus(422)
            ->assertJson([
                'error' => 'Invalid shipment status transition.',
            ]);

        $this->assertSame(CourierShipment::STATUS_PENDING, $shipment->fresh()->status);
    }

    public function test_update_status_is_idempotent_when_same_status_is_requested(): void
    {
        $user = User::factory()->create();
        $shipment = $this->createShipmentForUser($user);
        $csrfToken = 'test-token-idempotent-status';
        $initialTrackingCount = $shipment->trackingEvents()->count();

        $this->actingAs($user)
            ->withSession(['_token' => $csrfToken])
            ->post(route('courier.shipment.updateStatus', ['id' => $shipment->id]), [
                '_token' => $csrfToken,
                'status' => CourierShipment::STATUS_PENDING,
                'create_tracking_event' => true,
                'description' => 'No-op status update',
            ])
            ->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Shipment status is already up to date.',
            ]);

        $this->assertSame(CourierShipment::STATUS_PENDING, $shipment->fresh()->status);
        $this->assertSame($initialTrackingCount, $shipment->trackingEvents()->count());
    }

    public function test_cancel_shipment_is_idempotent_when_already_cancelled(): void
    {
        $user = User::factory()->create();
        $shipment = $this->createShipmentForUser($user);
        $csrfToken = 'test-token-idempotent-cancel';
        $beforeCancelTrackingCount = $shipment->trackingEvents()->count();

        $this->actingAs($user)
            ->withSession(['_token' => $csrfToken])
            ->post(route('courier.shipment.cancel', ['id' => $shipment->id]), [
                '_token' => $csrfToken,
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Shipment cancelled successfully.');

        $this->assertSame(CourierShipment::STATUS_CANCELLED, $shipment->fresh()->status);
        $afterFirstCancelTrackingCount = $shipment->trackingEvents()->count();
        $this->assertSame($beforeCancelTrackingCount + 1, $afterFirstCancelTrackingCount);

        $this->actingAs($user)
            ->withSession(['_token' => $csrfToken])
            ->post(route('courier.shipment.cancel', ['id' => $shipment->id]), [
                '_token' => $csrfToken,
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Shipment is already cancelled.');

        $this->assertSame(CourierShipment::STATUS_CANCELLED, $shipment->fresh()->status);
        $this->assertSame($afterFirstCancelTrackingCount, $shipment->trackingEvents()->count());
    }

    public function test_cancel_shipment_is_blocked_after_delivery(): void
    {
        $user = User::factory()->create();
        $shipment = $this->createShipmentForUser($user);
        $shipment->update(['status' => CourierShipment::STATUS_DELIVERED]);
        $csrfToken = 'test-token-cancel-delivered';

        $this->actingAs($user)
            ->withSession(['_token' => $csrfToken])
            ->post(route('courier.shipment.cancel', ['id' => $shipment->id]), [
                '_token' => $csrfToken,
            ])
            ->assertRedirect()
            ->assertSessionHas('error', 'Cannot cancel this shipment.');

        $this->assertSame(CourierShipment::STATUS_DELIVERED, $shipment->fresh()->status);
    }

    private function createShipmentForUser(User $user): CourierShipment
    {
        $payload = $this->validSubmissionPayload();
        $csrfToken = 'test-token-create-shipment';

        $this->actingAs($user)
            ->withSession(['_token' => $csrfToken, 'courier_preview' => $payload])
            ->post(route('couriers.store'), $payload + ['_token' => $csrfToken])
            ->assertRedirect(route('couriers.create'));

        return CourierShipment::query()
            ->where('requested_by_user_id', $user->id)
            ->latest('id')
            ->firstOrFail();
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
