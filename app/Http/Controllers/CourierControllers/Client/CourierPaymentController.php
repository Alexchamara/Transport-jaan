<?php

namespace App\Http\Controllers\CourierControllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Courier\CourierShipment;
use App\Models\Courier\CourierShipmentPayment;
use App\Services\Courier\PayHereGatewayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CourierPaymentController extends Controller
{
    public function checkout(Request $request, int $shipment)
    {
        $shipmentModel = CourierShipment::query()
            ->with(['sender', 'senderAddress', 'latestPayment'])
            ->findOrFail($shipment);

        $this->assertCanAccessShipment($request, $shipmentModel);

        $payment = $shipmentModel->latestPayment;
        if (!$payment instanceof CourierShipmentPayment) {
            return redirect()->route('couriers.flow.create', ['flow' => $this->resolveFlow($shipmentModel)])
                ->with('error', 'No card payment is pending for this shipment.');
        }

        $gateway = app(PayHereGatewayService::class);
        $checkout = $gateway->buildCheckoutPayload($payment, $shipmentModel, Auth::user());

        return Inertia::render('Web/courier/PaymentCheckout', [
            'shipment' => [
                'id' => (int) $shipmentModel->id,
                'reference' => (string) $shipmentModel->reference,
                'status' => (string) $shipmentModel->status,
            ],
            'payment' => [
                'id' => (int) $payment->id,
                'status' => (string) $payment->status,
                'method' => (string) $payment->payment_method,
                'provider' => (string) $payment->provider,
                'amount' => (float) $payment->amount,
                'currency' => (string) $payment->currency_code,
                'orderId' => (string) ($payment->gateway_order_id ?? ''),
                'gatewayPaymentId' => (string) ($payment->gateway_payment_id ?? ''),
                'txReference' => (string) ($payment->tx_reference ?? ''),
                'failureReason' => (string) ($payment->failure_reason ?? ''),
            ],
            'checkout' => $checkout,
            'pollingUrl' => route('couriers.payments.status', ['shipment' => (int) $shipmentModel->id]),
            'retryUrl' => route('couriers.payments.retry', ['shipment' => (int) $shipmentModel->id]),
            'returnToCreateUrl' => route('couriers.flow.create', ['flow' => $this->resolveFlow($shipmentModel)]),
        ]);
    }

    public function status(Request $request, int $shipment)
    {
        $shipmentModel = CourierShipment::query()
            ->with('latestPayment')
            ->findOrFail($shipment);

        $this->assertCanAccessShipment($request, $shipmentModel);

        $payment = $shipmentModel->latestPayment;

        return response()->json([
            'shipmentId' => (int) $shipmentModel->id,
            'shipmentStatus' => (string) $shipmentModel->status,
            'paymentStatus' => $payment?->status ?? $shipmentModel->resolvedPaymentStatus(),
            'paidAt' => optional($payment?->paid_at)->toIso8601String(),
            'failedAt' => optional($payment?->failed_at)->toIso8601String(),
            'failureReason' => (string) ($payment?->failure_reason ?? ''),
        ]);
    }

    public function retry(Request $request, int $shipment)
    {
        $shipmentModel = CourierShipment::query()
            ->with('latestPayment')
            ->findOrFail($shipment);

        $this->assertCanAccessShipment($request, $shipmentModel);

        $payment = $shipmentModel->latestPayment;
        if (!$payment instanceof CourierShipmentPayment) {
            return redirect()->back()->with('error', 'No pending courier card payment exists for retry.');
        }

        if ($payment->status === CourierShipmentPayment::STATUS_PAID) {
            return redirect()->back()->with('success', 'This courier payment is already completed.');
        }

        $payment->forceFill([
            'status' => CourierShipmentPayment::STATUS_PENDING,
            'gateway_order_id' => $this->generateGatewayOrderId($shipmentModel),
            'failed_at' => null,
            'failure_reason' => null,
            'initiated_at' => now(),
        ])->save();

        return redirect()->route('couriers.payments.checkout', ['shipment' => (int) $shipmentModel->id])
            ->with('success', 'Payment retry initialized. Continue with PayHere checkout.');
    }

    public function handleReturn(Request $request)
    {
        $orderId = trim((string) $request->query('order_id', ''));
        if ($orderId === '') {
            return redirect()->route('couriers.create')->with('error', 'Missing payment order reference.');
        }

        $payment = CourierShipmentPayment::query()
            ->where('gateway_order_id', $orderId)
            ->latest('id')
            ->first();

        if (!$payment instanceof CourierShipmentPayment) {
            return redirect()->route('couriers.create')->with('error', 'Payment record not found.');
        }

        $shipmentId = (int) $payment->courier_shipment_id;
        $message = $payment->status === CourierShipmentPayment::STATUS_PAID
            ? 'Payment completed successfully.'
            : 'Payment is still processing. Refresh status in a few seconds.';

        return redirect()->route('couriers.payments.checkout', ['shipment' => $shipmentId])->with('success', $message);
    }

    public function handleCancel(Request $request)
    {
        $orderId = trim((string) $request->query('order_id', ''));
        if ($orderId === '') {
            return redirect()->route('couriers.create')->with('warning', 'Payment cancelled.');
        }

        $payment = CourierShipmentPayment::query()
            ->where('gateway_order_id', $orderId)
            ->latest('id')
            ->first();

        if ($payment instanceof CourierShipmentPayment && $payment->status === CourierShipmentPayment::STATUS_PENDING) {
            $payment->forceFill([
                'status' => CourierShipmentPayment::STATUS_CANCELLED,
                'failed_at' => now(),
                'failure_reason' => 'Cancelled by customer at gateway.',
            ])->save();
        }

        if ($payment instanceof CourierShipmentPayment) {
            return redirect()->route('couriers.payments.checkout', ['shipment' => (int) $payment->courier_shipment_id])
                ->with('warning', 'Payment cancelled. You can retry checkout anytime.');
        }

        return redirect()->route('couriers.create')->with('warning', 'Payment cancelled.');
    }

    public function handleNotify(Request $request)
    {
        $payload = $request->all();
        $orderId = trim((string) ($payload['order_id'] ?? ''));

        if ($orderId === '') {
            return response('Missing order_id', 422);
        }

        $payment = CourierShipmentPayment::query()
            ->where('gateway_order_id', $orderId)
            ->latest('id')
            ->first();

        if (!$payment instanceof CourierShipmentPayment) {
            return response('Payment not found', 404);
        }

        $gateway = app(PayHereGatewayService::class);
        if (!$gateway->verifyNotifySignature($payload)) {
            return response('Invalid signature', 422);
        }

        $resolvedStatus = $gateway->normalizeStatusFromNotify($payload);

        DB::transaction(function () use ($payment, $payload, $resolvedStatus) {
            $currentCallbackPayload = is_array($payment->callback_payload) ? $payment->callback_payload : [];
            $currentCallbackPayload[] = [
                'received_at' => now()->toIso8601String(),
                'payload' => $payload,
            ];

            if ($resolvedStatus === CourierShipmentPayment::STATUS_PAID) {
                $payment->forceFill([
                    'status' => CourierShipmentPayment::STATUS_PAID,
                    'gateway_payment_id' => (string) ($payload['payment_id'] ?? $payment->gateway_payment_id),
                    'tx_reference' => (string) ($payload['payhere_reference'] ?? $payload['payment_id'] ?? $payment->tx_reference),
                    'gateway_status' => (string) ($payload['status_message'] ?? $payload['status_code'] ?? $payment->gateway_status),
                    'paid_at' => $payment->paid_at ?: now(),
                    'failed_at' => null,
                    'failure_reason' => null,
                    'last_notified_at' => now(),
                    'callback_payload' => $currentCallbackPayload,
                ])->save();

                return;
            }

            if (in_array($resolvedStatus, [
                CourierShipmentPayment::STATUS_FAILED,
                CourierShipmentPayment::STATUS_CANCELLED,
                CourierShipmentPayment::STATUS_EXPIRED,
            ], true)) {
                $payment->forceFill([
                    'status' => $resolvedStatus,
                    'gateway_status' => (string) ($payload['status_message'] ?? $payload['status_code'] ?? $payment->gateway_status),
                    'failed_at' => now(),
                    'failure_reason' => (string) ($payload['status_message'] ?? $payment->failure_reason ?? 'Gateway rejected payment.'),
                    'last_notified_at' => now(),
                    'callback_payload' => $currentCallbackPayload,
                ])->save();

                return;
            }

            $payment->forceFill([
                'status' => CourierShipmentPayment::STATUS_PENDING,
                'gateway_status' => (string) ($payload['status_message'] ?? $payload['status_code'] ?? $payment->gateway_status),
                'last_notified_at' => now(),
                'callback_payload' => $currentCallbackPayload,
            ])->save();
        });

        return response('OK', 200);
    }

    private function assertCanAccessShipment(Request $request, CourierShipment $shipment): void
    {
        $userId = Auth::id();
        if ($userId && (int) $shipment->requested_by_user_id === (int) $userId) {
            return;
        }

        $allowedIds = collect((array) $request->session()->get('courier_guest_bill_access_ids', []))
            ->map(fn ($value) => (int) $value)
            ->filter(fn ($value) => $value > 0)
            ->values();

        if ($allowedIds->contains((int) $shipment->id)) {
            return;
        }

        abort(403, 'You are not allowed to access this payment session.');
    }

    private function resolveFlow(CourierShipment $shipment): string
    {
        $senderCountry = strtoupper((string) ($shipment->senderAddress?->country ?? ''));
        $recipientCountry = strtoupper((string) ($shipment->recipientAddress?->country ?? ''));

        return $senderCountry === 'LK' && $recipientCountry === 'LK'
            ? 'domestic'
            : 'international';
    }

    private function generateGatewayOrderId(CourierShipment $shipment): string
    {
        return 'CPH-' . (int) $shipment->id . '-' . strtoupper(Str::random(8));
    }
}
