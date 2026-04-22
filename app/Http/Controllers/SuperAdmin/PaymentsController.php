<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Courier\CourierCodSettlementBatch;
use App\Models\Courier\CourierCodSettlementLine;
use App\Models\Courier\CourierShipment;
use App\Models\Courier\CourierShipmentPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentsController extends Controller
{
    /**
     * Display the payments page with all payment types.
     */
    public function index()
    {
        // Fetch booking payments
        $bookingPayments = DB::table('booking_payments')
            ->select('id', 'method', 'option', 'amount_paid', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        // Fetch air vehicle payments
        $airVehiclePayments = DB::table('air_vehicle_booking_payments')
            ->select('id', 'method', 'option', 'amount_paid', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        // Fetch sea vehicle payments
        $seaVehiclePayments = DB::table('sea_vehicle_booking_payments')
            ->select('id', 'method', 'option', 'amount_paid', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        // Fetch warehouse booking payments
        $warehousePayments = DB::table('warehouse_bookings')
            ->select('id', 'payment_method as method', 'payment_option as option', 'final_amount as amount_paid', 'payment_status as status', 'payment_date as created_at', 'booking_reference', 'company_name')
            ->whereNotNull('payment_status')
            ->orderBy('payment_date', 'desc')
            ->get();

        $courierPayments = CourierShipment::query()
            ->with(['latestPayment', 'sender:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function (CourierShipment $shipment) {
                $payment = $shipment->latestPayment;

                if (!$payment instanceof CourierShipmentPayment && !$shipment->isCodFlowDetectedForDashboard()) {
                    return null;
                }

                $snapshot = $shipment->resolveDashboardPaymentSnapshot($payment);
                $status = (string) ($snapshot['paymentStatus'] ?? CourierShipmentPayment::STATUS_PENDING);
                $method = (string) ($snapshot['paymentMethod'] ?? 'pending');
                $effectiveUpdatedAt = $payment instanceof CourierShipmentPayment
                    ? ($payment->paid_at ?: $payment->failed_at ?: $payment->last_notified_at ?: $payment->updated_at ?: $payment->created_at)
                    : ($shipment->cod_collection_recorded_at ?: $shipment->updated_at ?: $shipment->created_at);
                $amount = $payment instanceof CourierShipmentPayment
                    ? (float) $payment->amount
                    : (float) (($snapshot['codCollectedAmount'] ?? $snapshot['codRequestedAmount'] ?? $shipment->estimated_cost) ?: 0);

                return [
                    'id' => $payment instanceof CourierShipmentPayment
                        ? (int) $payment->id
                        : 'cod-' . (int) $shipment->id,
                    'shipment_reference' => (string) ($shipment->reference ?? 'N/A'),
                    'method' => $method,
                    'payment_method_raw' => (string) ($snapshot['paymentMethodRaw'] ?? ''),
                    'option' => (string) (($snapshot['paymentProvider'] ?? '') ?: ($method === CourierShipmentPayment::PAYMENT_METHOD_COD ? CourierShipmentPayment::PAYMENT_METHOD_COD : CourierShipmentPayment::PROVIDER_PAYHERE)),
                    'amount_paid' => round($amount, 2),
                    'currency_code' => strtoupper((string) (($payment instanceof CourierShipmentPayment ? $payment->currency_code : null) ?: ($shipment->currency_code ?: 'LKR'))),
                    'status' => $status,
                    'payment_reference' => (string) ($snapshot['paymentReference'] ?? ''),
                    'client_name' => (string) ($shipment->sender?->name ?? ''),
                    'gateway_order_id' => (string) ($payment?->gateway_order_id ?? ''),
                    'gateway_payment_id' => (string) ($payment?->gateway_payment_id ?? ''),
                    'tx_reference' => (string) ($payment?->tx_reference ?? ''),
                    'created_at' => optional($payment?->created_at ?: $shipment->created_at)->format('Y-m-d H:i:s'),
                    'initiated_at' => optional($payment?->initiated_at ?: $shipment->created_at)->format('Y-m-d H:i:s'),
                    'paid_at' => optional($payment?->paid_at ?: ($status === CourierShipmentPayment::STATUS_PAID ? $shipment->cod_collection_recorded_at : null))->format('Y-m-d H:i:s'),
                    'failed_at' => optional($payment?->failed_at ?: ($status === CourierShipmentPayment::STATUS_FAILED ? $shipment->cod_collection_recorded_at : null))->format('Y-m-d H:i:s'),
                    'last_notified_at' => optional($payment?->last_notified_at ?: $effectiveUpdatedAt)->format('Y-m-d H:i:s'),
                    'cod_requested_amount' => $snapshot['codRequestedAmount'] ?? null,
                    'cod_collected_amount' => $snapshot['codCollectedAmount'] ?? null,
                    'cod_collection_status' => $snapshot['codCollectionStatus'] ?? null,
                    'cod_handover_status' => $snapshot['codHandoverStatus'] ?? null,
                    'cod_handover_recorded_at' => $snapshot['codHandoverRecordedAt'] ?? null,
                    'cod_handover_verified_at' => $snapshot['codHandoverVerifiedAt'] ?? null,
                    'cod_manual_settlement_ready_at' => $snapshot['codManualSettlementReadyAt'] ?? null,
                ];
            })
            ->filter()
            ->values();

        $courierCardPayments = $courierPayments
            ->where('method', CourierShipmentPayment::PAYMENT_METHOD_CARD)
            ->values();

        $codPayoutReadyAmount = (float) CourierCodSettlementLine::query()
            ->join('courier_cod_settlement_batches', 'courier_cod_settlement_batches.id', '=', 'courier_cod_settlement_lines.courier_cod_settlement_batch_id')
            ->where('courier_cod_settlement_lines.line_status', CourierCodSettlementLine::STATUS_PAYOUT_READY)
            ->whereIn('courier_cod_settlement_batches.status', [
                CourierCodSettlementBatch::STATUS_RECONCILING,
                CourierCodSettlementBatch::STATUS_READY_FOR_PAYOUT,
            ])
            ->sum('courier_cod_settlement_lines.payout_amount');

        $codSettlementSummary = [
            'openBatchCount' => CourierCodSettlementBatch::query()
                ->whereIn('status', [CourierCodSettlementBatch::STATUS_RECONCILING, CourierCodSettlementBatch::STATUS_READY_FOR_PAYOUT])
                ->count(),
            'readyForPayoutBatchCount' => CourierCodSettlementBatch::query()
                ->where('status', CourierCodSettlementBatch::STATUS_READY_FOR_PAYOUT)
                ->count(),
            'openDisputeCount' => CourierCodSettlementLine::query()
                ->where('dispute_status', CourierCodSettlementLine::DISPUTE_STATUS_OPEN)
                ->count(),
            'payoutReadyAmount' => round($codPayoutReadyAmount, 2),
            'route' => route('superadmin.settings.cod-settlement.index'),
        ];

        $recentCodSettlementBatches = CourierCodSettlementBatch::query()
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(function (CourierCodSettlementBatch $batch) {
                return [
                    'id' => (int) $batch->id,
                    'reference' => (string) $batch->batch_reference,
                    'status' => (string) $batch->status,
                    'statusLabel' => $batch->statusLabel(),
                    'reconciliationStatusLabel' => $batch->reconciliationStatusLabel(),
                    'netPayoutAmount' => (float) $batch->net_payout_amount,
                    'currencyCode' => (string) $batch->currency_code,
                    'generatedAt' => optional($batch->generated_at)->format('Y-m-d H:i:s'),
                ];
            })
            ->values();

        return Inertia::render('Web/home/SuperAdmin/Payments', [
            'bookingPayments' => $bookingPayments->toArray(),
            'airVehiclePayments' => $airVehiclePayments->toArray(),
            'seaVehiclePayments' => $seaVehiclePayments->toArray(),
            'warehousePayments' => $warehousePayments->toArray(),
            'courierPayments' => $courierPayments,
            'courierCardPayments' => $courierCardPayments,
            'codSettlementSummary' => $codSettlementSummary,
            'recentCodSettlementBatches' => $recentCodSettlementBatches,
        ]);
    }

    /**
     * Get payment statistics for dashboard or API.
     */
    public function getPaymentStats()
    {
        $codScope = function ($query): void {
            $query->where('is_cod_enabled', true)
                ->orWhere('cod_requested_amount', '>', 0)
                ->orWhere('cod_collected_amount', '>', 0)
                ->orWhereNotNull('cod_capability_id')
                ->orWhereNotNull('cod_requested_method')
                ->orWhereNotNull('cod_collection_status');
        };

        $stats = [
            'booking_payments' => [
                'total' => DB::table('booking_payments')->sum('amount_paid'),
                'count' => DB::table('booking_payments')->count(),
                'paid' => DB::table('booking_payments')->where('status', 'paid')->count(),
                'pending' => DB::table('booking_payments')->where('status', 'pending')->count(),
            ],
            'air_vehicle_payments' => [
                'total' => DB::table('air_vehicle_booking_payments')->sum('amount_paid'),
                'count' => DB::table('air_vehicle_booking_payments')->count(),
                'paid' => DB::table('air_vehicle_booking_payments')->where('status', 'paid')->count(),
                'pending' => DB::table('air_vehicle_booking_payments')->where('status', 'pending')->count(),
            ],
            'sea_vehicle_payments' => [
                'total' => DB::table('sea_vehicle_booking_payments')->sum('amount_paid'),
                'count' => DB::table('sea_vehicle_booking_payments')->count(),
                'paid' => DB::table('sea_vehicle_booking_payments')->where('status', 'paid')->count(),
                'pending' => DB::table('sea_vehicle_booking_payments')->where('status', 'pending')->count(),
            ],
            'courier_card_payments' => [
                'total' => CourierShipmentPayment::query()
                    ->where('provider', CourierShipmentPayment::PROVIDER_PAYHERE)
                    ->where('payment_method', CourierShipmentPayment::PAYMENT_METHOD_CARD)
                    ->sum('amount'),
                'count' => CourierShipmentPayment::query()
                    ->where('provider', CourierShipmentPayment::PROVIDER_PAYHERE)
                    ->where('payment_method', CourierShipmentPayment::PAYMENT_METHOD_CARD)
                    ->count(),
                'paid' => CourierShipmentPayment::query()
                    ->where('provider', CourierShipmentPayment::PROVIDER_PAYHERE)
                    ->where('payment_method', CourierShipmentPayment::PAYMENT_METHOD_CARD)
                    ->where('status', CourierShipmentPayment::STATUS_PAID)
                    ->count(),
                'pending' => CourierShipmentPayment::query()
                    ->where('provider', CourierShipmentPayment::PROVIDER_PAYHERE)
                    ->where('payment_method', CourierShipmentPayment::PAYMENT_METHOD_CARD)
                    ->where('status', CourierShipmentPayment::STATUS_PENDING)
                    ->count(),
                'failed' => CourierShipmentPayment::query()
                    ->where('provider', CourierShipmentPayment::PROVIDER_PAYHERE)
                    ->where('payment_method', CourierShipmentPayment::PAYMENT_METHOD_CARD)
                    ->whereIn('status', [
                        CourierShipmentPayment::STATUS_FAILED,
                        CourierShipmentPayment::STATUS_CANCELLED,
                        CourierShipmentPayment::STATUS_EXPIRED,
                    ])
                    ->count(),
            ],
            'courier_cod_payments' => [
                'count' => CourierShipment::query()
                    ->where($codScope)
                    ->count(),
                'paid' => CourierShipment::query()
                    ->where($codScope)
                    ->whereIn('cod_collection_status', ['collected', 'partially_collected'])
                    ->count(),
                'pending' => CourierShipment::query()
                    ->where($codScope)
                    ->where(function ($query) {
                        $query->whereNull('cod_collection_status')
                            ->orWhereNotIn('cod_collection_status', ['collected', 'partially_collected', 'failed', 'refused']);
                    })
                    ->count(),
                'failed' => CourierShipment::query()
                    ->where($codScope)
                    ->whereIn('cod_collection_status', ['failed', 'refused'])
                    ->count(),
            ],
        ];

        return response()->json($stats);
    }
}
