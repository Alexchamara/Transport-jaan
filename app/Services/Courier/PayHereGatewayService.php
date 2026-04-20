<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierShipment;
use App\Models\Courier\CourierShipmentPayment;
use App\Models\User;

class PayHereGatewayService
{
    public function isEnabled(): bool
    {
        return (bool) config('courier.payments.enabled', false)
            && (bool) config('courier.payments.provider.payhere.enabled', false);
    }

    public function buildCheckoutPayload(CourierShipmentPayment $payment, CourierShipment $shipment, ?User $user = null): array
    {
        $merchantId = trim((string) config('services.payhere.merchant_id', ''));
        $merchantSecret = (string) config('services.payhere.merchant_secret', '');
        $orderId = trim((string) $payment->gateway_order_id);
        $currency = strtoupper(trim((string) ($payment->currency_code ?: 'LKR')));
        $amount = number_format((float) $payment->amount, 2, '.', '');

        $senderName = trim((string) ($shipment->sender?->name ?? $user?->name ?? 'Courier Customer'));
        [$firstName, $lastName] = $this->splitName($senderName);

        $fields = [
            'merchant_id' => $merchantId,
            'return_url' => route('couriers.payments.payhere.return', [
                'order_id' => $orderId,
            ]),
            'cancel_url' => route('couriers.payments.payhere.cancel', [
                'order_id' => $orderId,
            ]),
            'notify_url' => route('couriers.payments.payhere.notify'),
            'order_id' => $orderId,
            'items' => 'Courier Shipment ' . (string) $shipment->reference,
            'currency' => $currency,
            'amount' => $amount,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => (string) ($shipment->sender?->email ?? $user?->email ?? ''),
            'phone' => (string) ($shipment->sender?->phone ?? $user?->phone ?? ''),
            'address' => (string) ($shipment->senderAddress?->line1 ?? ''),
            'city' => (string) ($shipment->senderAddress?->city ?? ''),
            'country' => strtoupper((string) ($shipment->senderAddress?->country ?? 'LK')),
        ];

        $isReady = $merchantId !== '' && $merchantSecret !== '' && $orderId !== '';
        if ($isReady) {
            $fields['hash'] = $this->computeCheckoutHash($merchantId, $orderId, $amount, $currency, $merchantSecret);
        }

        return [
            'isReady' => $isReady,
            'reason' => $isReady ? null : 'PayHere merchant credentials are not configured.',
            'checkoutUrl' => (string) config('services.payhere.checkout_base_url', 'https://sandbox.payhere.lk/pay/checkout'),
            'fields' => $fields,
        ];
    }

    public function verifyNotifySignature(array $payload): bool
    {
        $merchantId = trim((string) config('services.payhere.merchant_id', ''));
        $notifySecret = (string) config('services.payhere.notify_secret', config('services.payhere.merchant_secret', ''));

        $payloadMerchantId = trim((string) ($payload['merchant_id'] ?? ''));
        $normalized = $this->extractNotifyOrderAmountCurrency($payload);
        $orderId = $normalized['orderId'];
        $amount = $normalized['amount'];
        $currency = $normalized['currency'];
        $statusCode = (string) ($payload['status_code'] ?? '');
        $providedSignature = strtoupper(trim((string) ($payload['md5sig'] ?? '')));

        if ($merchantId === '' || $notifySecret === '' || $payloadMerchantId === '' || $orderId === '' || $providedSignature === '') {
            return false;
        }

        if (!hash_equals($merchantId, $payloadMerchantId)) {
            return false;
        }

        $expectedSignature = $this->computeNotifySignature(
            $merchantId,
            $orderId,
            $amount,
            $currency,
            $statusCode,
            $notifySecret
        );

        return hash_equals($expectedSignature, $providedSignature);
    }

    public function validateNotifyAgainstPayment(array $payload, CourierShipmentPayment $payment): array
    {
        $normalized = $this->extractNotifyOrderAmountCurrency($payload);

        $expectedOrderId = trim((string) ($payment->gateway_order_id ?? ''));
        $expectedAmount = number_format((float) $payment->amount, 2, '.', '');
        $expectedCurrency = strtoupper(trim((string) ($payment->currency_code ?: 'LKR')));

        if ($normalized['orderId'] === '' || $expectedOrderId === '' || !hash_equals($expectedOrderId, $normalized['orderId'])) {
            return [
                'isValid' => false,
                'reason' => 'order_id mismatch',
                'expectedOrderId' => $expectedOrderId,
                'receivedOrderId' => $normalized['orderId'],
            ];
        }

        if ($normalized['currency'] === '' || !hash_equals($expectedCurrency, $normalized['currency'])) {
            return [
                'isValid' => false,
                'reason' => 'currency mismatch',
                'expectedCurrency' => $expectedCurrency,
                'receivedCurrency' => $normalized['currency'],
            ];
        }

        if (!hash_equals($expectedAmount, $normalized['amount'])) {
            return [
                'isValid' => false,
                'reason' => 'amount mismatch',
                'expectedAmount' => $expectedAmount,
                'receivedAmount' => $normalized['amount'],
            ];
        }

        return [
            'isValid' => true,
            'reason' => null,
            'expectedOrderId' => $expectedOrderId,
            'receivedOrderId' => $normalized['orderId'],
            'expectedAmount' => $expectedAmount,
            'receivedAmount' => $normalized['amount'],
            'expectedCurrency' => $expectedCurrency,
            'receivedCurrency' => $normalized['currency'],
        ];
    }

    public function normalizeStatusFromNotify(array $payload): string
    {
        $statusCode = (int) ($payload['status_code'] ?? 0);

        return match ($statusCode) {
            2 => CourierShipmentPayment::STATUS_PAID,
            -1 => CourierShipmentPayment::STATUS_CANCELLED,
            -2 => CourierShipmentPayment::STATUS_FAILED,
            default => CourierShipmentPayment::STATUS_PENDING,
        };
    }

    public function computeCheckoutHash(
        string $merchantId,
        string $orderId,
        string $amount,
        string $currency,
        string $merchantSecret
    ): string {
        $secretHash = strtoupper(md5($merchantSecret));

        return strtoupper(md5($merchantId . $orderId . $amount . $currency . $secretHash));
    }

    public function computeNotifySignature(
        string $merchantId,
        string $orderId,
        string $amount,
        string $currency,
        string $statusCode,
        string $merchantSecret
    ): string {
        $secretHash = strtoupper(md5($merchantSecret));

        return strtoupper(md5($merchantId . $orderId . $amount . $currency . $statusCode . $secretHash));
    }

    public function extractNotifyOrderAmountCurrency(array $payload): array
    {
        return [
            'orderId' => trim((string) ($payload['order_id'] ?? '')),
            'amount' => number_format((float) ($payload['payhere_amount'] ?? $payload['amount'] ?? 0), 2, '.', ''),
            'currency' => strtoupper(trim((string) ($payload['payhere_currency'] ?? $payload['currency'] ?? ''))),
        ];
    }

    private function splitName(string $name): array
    {
        $parts = array_values(array_filter(explode(' ', trim($name))));
        if (count($parts) === 0) {
            return ['Courier', 'Customer'];
        }

        if (count($parts) === 1) {
            return [$parts[0], '-'];
        }

        $firstName = array_shift($parts);

        return [$firstName, implode(' ', $parts)];
    }
}
