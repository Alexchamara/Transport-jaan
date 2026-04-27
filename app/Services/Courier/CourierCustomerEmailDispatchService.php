<?php

namespace App\Services\Courier;

use App\Jobs\SendCourierCustomerEmailJob;
use App\Models\Courier\CourierCustomerEmailDispatch;
use App\Models\Courier\CourierShipment;
use App\Models\Courier\CourierShipmentPayment;
use App\Models\Courier\CourierTrackingEvent;
use App\Models\Courier\VendorCourierSetting;

class CourierCustomerEmailDispatchService
{
    public const EVENT_SHIPMENT_PLACED = 'shipment_placed';
    public const EVENT_BOOKING_CONFIRMED = 'booking_confirmed';
    public const EVENT_BOOKING_CANCELLED = 'booking_cancelled';
    public const EVENT_TRACKING_PICKED_UP = 'tracking_picked_up';
    public const EVENT_TRACKING_OUT_FOR_DELIVERY = 'tracking_out_for_delivery';
    public const EVENT_TRACKING_DELIVERED = 'tracking_delivered';
    public const EVENT_PAYMENT_PAID = 'payment_paid';
    public const EVENT_PAYMENT_FAILED = 'payment_failed';
    public const EVENT_PAYMENT_CANCELLED = 'payment_cancelled';

    /**
     * @return array<string, string>
     */
    private function eventToggleMap(): array
    {
        return [
            self::EVENT_SHIPMENT_PLACED => 'notifyClientShipmentPlaced',
            self::EVENT_BOOKING_CONFIRMED => 'notifyClientBookingConfirmed',
            self::EVENT_BOOKING_CANCELLED => 'notifyClientBookingCancelled',
            self::EVENT_TRACKING_PICKED_UP => 'notifyClientPickup',
            self::EVENT_TRACKING_OUT_FOR_DELIVERY => 'notifyClientOutForDelivery',
            self::EVENT_TRACKING_DELIVERED => 'notifyClientDelivered',
            self::EVENT_PAYMENT_PAID => 'notifyClientPaymentPaid',
            self::EVENT_PAYMENT_FAILED => 'notifyClientPaymentFailed',
            self::EVENT_PAYMENT_CANCELLED => 'notifyClientPaymentCancelled',
        ];
    }

    /**
     * @return array<string, bool>
     */
    public function defaultNotificationFlags(): array
    {
        return [
            'notifyClientShipmentPlaced' => true,
            'notifyClientBookingConfirmed' => true,
            'notifyClientBookingCancelled' => true,
            'notifyClientPickup' => true,
            'notifyClientOutForDelivery' => true,
            'notifyClientDelivered' => true,
            'notifyClientPaymentPaid' => true,
            'notifyClientPaymentFailed' => true,
            'notifyClientPaymentCancelled' => true,
        ];
    }

    public function queueShipmentPlaced(CourierShipment $shipment): int
    {
        return $this->queueShipmentEvent($shipment, self::EVENT_SHIPMENT_PLACED);
    }

    public function queueBookingConfirmed(CourierShipment $shipment, ?CourierTrackingEvent $trackingEvent = null): int
    {
        return $this->queueShipmentEvent($shipment, self::EVENT_BOOKING_CONFIRMED, trackingEvent: $trackingEvent);
    }

    public function queueBookingCancelled(CourierShipment $shipment, ?CourierTrackingEvent $trackingEvent = null): int
    {
        return $this->queueShipmentEvent($shipment, self::EVENT_BOOKING_CANCELLED, trackingEvent: $trackingEvent);
    }

    public function queueTrackingPickedUp(CourierShipment $shipment, CourierTrackingEvent $trackingEvent): int
    {
        return $this->queueShipmentEvent($shipment, self::EVENT_TRACKING_PICKED_UP, trackingEvent: $trackingEvent);
    }

    public function queueTrackingOutForDelivery(CourierShipment $shipment, CourierTrackingEvent $trackingEvent): int
    {
        return $this->queueShipmentEvent($shipment, self::EVENT_TRACKING_OUT_FOR_DELIVERY, trackingEvent: $trackingEvent);
    }

    public function queueTrackingDelivered(CourierShipment $shipment, CourierTrackingEvent $trackingEvent): int
    {
        return $this->queueShipmentEvent($shipment, self::EVENT_TRACKING_DELIVERED, trackingEvent: $trackingEvent);
    }

    public function queuePaymentPaid(CourierShipmentPayment $payment): int
    {
        return $this->queuePaymentEvent($payment, self::EVENT_PAYMENT_PAID);
    }

    public function queuePaymentFailed(CourierShipmentPayment $payment): int
    {
        return $this->queuePaymentEvent($payment, self::EVENT_PAYMENT_FAILED);
    }

    public function queuePaymentCancelled(CourierShipmentPayment $payment): int
    {
        return $this->queuePaymentEvent($payment, self::EVENT_PAYMENT_CANCELLED);
    }

    private function queuePaymentEvent(CourierShipmentPayment $payment, string $eventType): int
    {
        $shipment = $payment->relationLoaded('shipment')
            ? $payment->getRelation('shipment')
            : $payment->shipment()->first();

        if (!$shipment instanceof CourierShipment) {
            return 0;
        }

        return $this->queueShipmentEvent($shipment, $eventType, payment: $payment);
    }

    private function queueShipmentEvent(
        CourierShipment $shipment,
        string $eventType,
        ?CourierShipmentPayment $payment = null,
        ?CourierTrackingEvent $trackingEvent = null
    ): int {
        $shipment->loadMissing([
            'requestedBy:id,email,name',
            'sender:id,email,name',
        ]);

        if (!$this->isEventEnabledForVendor($shipment, $eventType)) {
            return 0;
        }

        $sourceKey = $this->resolveSourceKey($shipment, $payment, $trackingEvent);
        $payload = $this->buildPayload($shipment, $eventType, $payment, $trackingEvent);
        $candidates = $this->resolveRecipientCandidates($shipment);

        $created = 0;

        foreach ($candidates as $candidate) {
            $email = $this->normalizeEmail((string) ($candidate['email'] ?? ''));
            $kind = (string) ($candidate['kind'] ?? 'unknown');
            $isValid = $email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL);
            $recipientKey = $email !== '' ? $email : ('missing:' . $kind);
            $dedupeKey = sha1(implode('|', [
                'courier',
                'customer_email',
                $eventType,
                $sourceKey,
                $recipientKey,
            ]));

            $dispatch = CourierCustomerEmailDispatch::query()->firstOrCreate(
                ['dedupe_key' => $dedupeKey],
                [
                    'shipment_id' => (int) $shipment->id,
                    'payment_id' => $payment?->id ? (int) $payment->id : null,
                    'tracking_event_id' => $trackingEvent?->id ? (int) $trackingEvent->id : null,
                    'event_type' => $eventType,
                    'recipient_email' => $email,
                    'recipient_kind' => $kind,
                    'status' => $isValid
                        ? CourierCustomerEmailDispatch::STATUS_PENDING
                        : CourierCustomerEmailDispatch::STATUS_SKIPPED,
                    'payload' => $payload,
                    'queued_at' => now(),
                    'last_error' => $isValid ? null : 'Recipient email is missing or invalid.',
                ]
            );

            if (!$dispatch->wasRecentlyCreated) {
                continue;
            }

            $created++;

            if ((string) $dispatch->status === CourierCustomerEmailDispatch::STATUS_PENDING) {
                SendCourierCustomerEmailJob::dispatch((int) $dispatch->id)->afterCommit();
            }
        }

        return $created;
    }

    /**
     * @return array<int, array{kind: string, email: string}>
     */
    private function resolveRecipientCandidates(CourierShipment $shipment): array
    {
        return [
            [
                'kind' => 'requester',
                'email' => (string) ($shipment->requestedBy?->email ?? ''),
            ],
            [
                'kind' => 'sender',
                'email' => (string) ($shipment->sender?->email ?? ''),
            ],
        ];
    }

    private function resolveSourceKey(
        CourierShipment $shipment,
        ?CourierShipmentPayment $payment,
        ?CourierTrackingEvent $trackingEvent
    ): string {
        if ($payment?->id) {
            return 'payment:' . (int) $payment->id;
        }

        if ($trackingEvent?->id) {
            return 'tracking:' . (int) $trackingEvent->id;
        }

        return 'shipment:' . (int) $shipment->id;
    }

    /**
     * @return array<string, mixed>
     */
    private function buildPayload(
        CourierShipment $shipment,
        string $eventType,
        ?CourierShipmentPayment $payment,
        ?CourierTrackingEvent $trackingEvent
    ): array {
        return [
            'eventType' => $eventType,
            'shipment' => [
                'id' => (int) $shipment->id,
                'reference' => (string) ($shipment->reference ?? ''),
                'status' => (string) ($shipment->status ?? ''),
                'serviceLevel' => (string) ($shipment->service_level ?? ''),
            ],
            'payment' => $payment ? [
                'id' => (int) $payment->id,
                'status' => (string) ($payment->status ?? ''),
                'method' => (string) ($payment->payment_method ?? ''),
                'provider' => (string) ($payment->provider ?? ''),
                'amount' => (float) ($payment->amount ?? 0),
                'currency' => (string) ($payment->currency_code ?? ''),
                'orderId' => (string) ($payment->gateway_order_id ?? ''),
                'txReference' => (string) ($payment->tx_reference ?? ''),
            ] : null,
            'tracking' => $trackingEvent ? [
                'id' => (int) $trackingEvent->id,
                'status' => (string) ($trackingEvent->status ?? ''),
                'location' => (string) ($trackingEvent->location ?? ''),
                'description' => (string) ($trackingEvent->description ?? ''),
                'recordedAt' => optional($trackingEvent->recorded_at)->toIso8601String(),
            ] : null,
            'queuedAt' => now()->toIso8601String(),
        ];
    }

    private function isEventEnabledForVendor(CourierShipment $shipment, string $eventType): bool
    {
        $toggleMap = $this->eventToggleMap();
        $toggleKey = $toggleMap[$eventType] ?? null;

        if (!$toggleKey) {
            return true;
        }

        $defaults = $this->defaultNotificationFlags();
        $vendorId = (int) ($shipment->assigned_vendor_user_id ?? 0);

        if ($vendorId <= 0) {
            return (bool) ($defaults[$toggleKey] ?? true);
        }

        $settings = VendorCourierSetting::query()
            ->where('vendor_user_id', $vendorId)
            ->value('settings');

        if (!is_array($settings)) {
            if (is_string($settings)) {
                $decoded = json_decode($settings, true);
                $settings = is_array($decoded) ? $decoded : [];
            } else {
                $settings = [];
            }
        }

        $notifications = is_array($settings['notifications'] ?? null)
            ? $settings['notifications']
            : [];

        return (bool) ($notifications[$toggleKey] ?? $defaults[$toggleKey] ?? true);
    }

    private function normalizeEmail(string $email): string
    {
        return mb_strtolower(trim($email));
    }
}
