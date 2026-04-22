<?php

namespace Tests\Unit\Courier;

use App\Models\Courier\CourierShipment;
use App\Models\Courier\CourierShipmentPayment;
use Tests\TestCase;

class CourierShipmentPaymentSnapshotTest extends TestCase
{
    public function test_snapshot_uses_latest_card_payment_when_available(): void
    {
        $shipment = new CourierShipment();
        $shipment->status = CourierShipment::STATUS_CONFIRMED;
        $shipment->estimated_cost = 4200;
        $shipment->currency_code = 'LKR';

        $payment = new CourierShipmentPayment();
        $payment->status = CourierShipmentPayment::STATUS_PENDING;
        $payment->payment_method = CourierShipmentPayment::PAYMENT_METHOD_CARD;
        $payment->provider = CourierShipmentPayment::PROVIDER_PAYHERE;
        $payment->is_required = true;
        $payment->tx_reference = 'TX-UNIT-SNAPSHOT';
        $shipment->setRelation('latestPayment', $payment);

        $snapshot = $shipment->resolveDashboardPaymentSnapshot();

        $this->assertSame(CourierShipmentPayment::STATUS_PENDING, $snapshot['paymentStatus']);
        $this->assertSame(CourierShipmentPayment::PAYMENT_METHOD_CARD, $snapshot['paymentMethod']);
        $this->assertSame(CourierShipmentPayment::PAYMENT_METHOD_CARD, $snapshot['paymentMethodRaw']);
        $this->assertSame(CourierShipmentPayment::PROVIDER_PAYHERE, $snapshot['paymentProvider']);
        $this->assertSame('TX-UNIT-SNAPSHOT', $snapshot['paymentReference']);
        $this->assertTrue($snapshot['cardRequired']);
        $this->assertTrue($snapshot['lifecycleBlocked']);
    }

    public function test_snapshot_defaults_cod_to_pending_without_collection_event(): void
    {
        $shipment = new CourierShipment();
        $shipment->status = CourierShipment::STATUS_DELIVERED;
        $shipment->is_cod_enabled = true;
        $shipment->cod_requested_amount = 1600;
        $shipment->cod_collection_status = null;

        $snapshot = $shipment->resolveDashboardPaymentSnapshot();

        $this->assertSame(CourierShipmentPayment::STATUS_PENDING, $snapshot['paymentStatus']);
        $this->assertSame(CourierShipmentPayment::PAYMENT_METHOD_COD, $snapshot['paymentMethod']);
        $this->assertSame(CourierShipmentPayment::PAYMENT_METHOD_COD, $snapshot['paymentMethodRaw']);
        $this->assertFalse($snapshot['cardRequired']);
        $this->assertFalse($snapshot['lifecycleBlocked']);
        $this->assertEqualsWithDelta(1600.0, (float) ($snapshot['codRequestedAmount'] ?? 0), 0.01);
    }

    public function test_snapshot_maps_partial_cod_collection_to_paid(): void
    {
        $shipment = new CourierShipment();
        $shipment->status = CourierShipment::STATUS_DELIVERED;
        $shipment->is_cod_enabled = true;
        $shipment->cod_requested_amount = 1000;
        $shipment->cod_collected_amount = 700;
        $shipment->cod_collection_status = 'partially_collected';

        $snapshot = $shipment->resolveDashboardPaymentSnapshot();

        $this->assertSame(CourierShipmentPayment::STATUS_PAID, $snapshot['paymentStatus']);
        $this->assertSame(CourierShipmentPayment::PAYMENT_METHOD_COD, $snapshot['paymentMethod']);
        $this->assertEqualsWithDelta(700.0, (float) ($snapshot['codCollectedAmount'] ?? 0), 0.01);
        $this->assertSame(CourierShipmentPayment::STATUS_PAID, $shipment->resolvedPaymentStatus());
    }

    public function test_snapshot_maps_failed_or_refused_cod_to_failed_status(): void
    {
        $failedShipment = new CourierShipment();
        $failedShipment->status = CourierShipment::STATUS_DELIVERED;
        $failedShipment->is_cod_enabled = true;
        $failedShipment->cod_collection_status = 'failed';

        $refusedShipment = new CourierShipment();
        $refusedShipment->status = CourierShipment::STATUS_DELIVERED;
        $refusedShipment->is_cod_enabled = true;
        $refusedShipment->cod_collection_status = 'refused';

        $this->assertSame(CourierShipmentPayment::STATUS_FAILED, $failedShipment->resolveDashboardPaymentSnapshot()['paymentStatus']);
        $this->assertSame(CourierShipmentPayment::STATUS_FAILED, $refusedShipment->resolveDashboardPaymentSnapshot()['paymentStatus']);
    }

    public function test_snapshot_infers_cod_when_legacy_flag_is_false_but_cod_data_exists(): void
    {
        $shipment = new CourierShipment();
        $shipment->status = CourierShipment::STATUS_CONFIRMED;
        $shipment->is_cod_enabled = false;
        $shipment->cod_requested_amount = 6400;
        $shipment->cod_requested_method = 'cash';

        $snapshot = $shipment->resolveDashboardPaymentSnapshot();

        $this->assertTrue($shipment->isCodFlowDetectedForDashboard());
        $this->assertTrue((bool) ($snapshot['codEnabled'] ?? false));
        $this->assertSame(CourierShipmentPayment::PAYMENT_METHOD_COD, $snapshot['paymentMethod']);
        $this->assertSame(CourierShipmentPayment::STATUS_PENDING, $snapshot['paymentStatus']);
    }

    public function test_snapshot_reclassifies_unknown_payment_method_to_cod_when_cod_evidence_exists(): void
    {
        $shipment = new CourierShipment();
        $shipment->status = CourierShipment::STATUS_DELIVERED;
        $shipment->is_cod_enabled = false;
        $shipment->cod_requested_amount = 6400;
        $shipment->cod_requested_method = 'cash';
        $shipment->cod_collection_status = 'partially_collected';

        $payment = new CourierShipmentPayment();
        $payment->status = CourierShipmentPayment::STATUS_PENDING;
        $payment->payment_method = 'other';
        $payment->provider = CourierShipmentPayment::PROVIDER_PAYHERE;
        $payment->is_required = false;
        $shipment->setRelation('latestPayment', $payment);

        $snapshot = $shipment->resolveDashboardPaymentSnapshot();

        $this->assertSame('other', $snapshot['paymentMethodRaw']);
        $this->assertSame(CourierShipmentPayment::PAYMENT_METHOD_COD, $snapshot['paymentMethod']);
        $this->assertSame(CourierShipmentPayment::STATUS_PAID, $snapshot['paymentStatus']);
        $this->assertFalse($snapshot['cardRequired']);
        $this->assertFalse($snapshot['lifecycleBlocked']);
    }

    public function test_snapshot_preserves_non_cod_fallback_when_no_payment_exists(): void
    {
        $pendingShipment = new CourierShipment();
        $pendingShipment->status = CourierShipment::STATUS_PENDING;
        $pendingShipment->estimated_cost = 0;
        $pendingSnapshot = $pendingShipment->resolveDashboardPaymentSnapshot();

        $paidFallbackShipment = new CourierShipment();
        $paidFallbackShipment->status = CourierShipment::STATUS_CONFIRMED;
        $paidFallbackShipment->estimated_cost = 2000;
        $paidSnapshot = $paidFallbackShipment->resolveDashboardPaymentSnapshot();

        $this->assertSame(CourierShipmentPayment::STATUS_PENDING, $pendingSnapshot['paymentStatus']);
        $this->assertSame(CourierShipmentPayment::STATUS_PAID, $paidSnapshot['paymentStatus']);
        $this->assertSame('pending', $pendingSnapshot['paymentMethod']);
        $this->assertSame('pending', $paidSnapshot['paymentMethod']);
    }
}
