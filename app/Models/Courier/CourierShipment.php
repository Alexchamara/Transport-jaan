<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class CourierShipment extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_IN_TRANSIT = 'in_transit';
    public const STATUS_DELIVERED = 'delivered';
    public const STATUS_CANCELLED = 'cancelled';

    public const ASSIGNMENT_STATUS_UNASSIGNED = 'unassigned';
    public const ASSIGNMENT_STATUS_ASSIGNED = 'assigned';

    protected $fillable = [
        'reference',
        'requested_by_user_id',
        'assigned_vendor_user_id',
        'assigned_vendor_registration_id',
        'sender_contact_id',
        'recipient_contact_id',
        'sender_address_id',
        'recipient_address_id',
        'service_level',
        'status',
        'assignment_category',
        'assignment_status',
        'assigned_at',
        'pickup_date',
        'pickup_window_start',
        'pickup_window_end',
        'insurance_required',
        'declared_value',
        'is_cod_enabled',
        'cod_requested_amount',
        'cod_requested_method',
        'cod_capability_id',
        'cod_policy_snapshot',
        'cod_collection_status',
        'cod_collected_amount',
        'cod_collection_recorded_at',
        'currency_code',
        'estimated_cost',
        'actual_cost',
        'delivery_notes',
        'internal_notes',
    ];

    protected $casts = [
        'pickup_date' => 'date',
        'pickup_window_start' => 'datetime:H:i',
        'pickup_window_end' => 'datetime:H:i',
        'assigned_at' => 'datetime',
        'insurance_required' => 'boolean',
        'declared_value' => 'decimal:2',
        'is_cod_enabled' => 'boolean',
        'cod_requested_amount' => 'decimal:2',
        'cod_policy_snapshot' => 'array',
        'cod_collected_amount' => 'decimal:2',
        'cod_collection_recorded_at' => 'datetime',
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $shipment) {
            if (empty($shipment->reference)) {
                $shipment->reference = self::generateReference();
            }

            if (empty($shipment->status)) {
                $shipment->status = self::STATUS_PENDING;
            }
        });
    }

    public static function generateReference(): string
    {
        return 'CR-' . strtoupper(Str::random(8));
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    public function assignedVendor()
    {
        return $this->belongsTo(User::class, 'assigned_vendor_user_id');
    }

    public function assignedVendorRegistration()
    {
        return $this->belongsTo(\App\Models\VendorServiceRegistration::class, 'assigned_vendor_registration_id');
    }

    public function codCapability()
    {
        return $this->belongsTo(CourierVendorCodCapability::class, 'cod_capability_id');
    }

    public function sender()
    {
        return $this->belongsTo(CourierContact::class, 'sender_contact_id');
    }

    public function recipient()
    {
        return $this->belongsTo(CourierContact::class, 'recipient_contact_id');
    }

    public function senderAddress()
    {
        return $this->belongsTo(CourierAddress::class, 'sender_address_id');
    }

    public function recipientAddress()
    {
        return $this->belongsTo(CourierAddress::class, 'recipient_address_id');
    }

    public function packages()
    {
        return $this->hasMany(CourierPackage::class, 'shipment_id');
    }

    public function trackingEvents()
    {
        return $this->hasMany(CourierTrackingEvent::class, 'shipment_id');
    }

    public function labels()
    {
        return $this->hasMany(VendorCourierLabel::class, 'shipment_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(CourierShipmentPayment::class, 'courier_shipment_id');
    }

    public function latestPayment(): HasOne
    {
        return $this->hasOne(CourierShipmentPayment::class, 'courier_shipment_id')->latestOfMany();
    }

    public function codSettlementLines()
    {
        return $this->hasMany(CourierCodSettlementLine::class, 'shipment_id');
    }

    public function superAdminActionAudits()
    {
        return $this->hasMany(SuperAdminCourierActionAudit::class, 'shipment_id');
    }

    public function resolvedPaymentStatus(): string
    {
        return (string) ($this->resolveDashboardPaymentSnapshot()['paymentStatus'] ?? CourierShipmentPayment::STATUS_PENDING);
    }

    public function requiresCardPayment(): bool
    {
        return (bool) ($this->resolveDashboardPaymentSnapshot()['cardRequired'] ?? false);
    }

    public function resolveDashboardPaymentSnapshot(?CourierShipmentPayment $latestPayment = null): array
    {
        $codFlowDetected = $this->isCodFlowDetectedForDashboard();

        $resolvedPayment = $latestPayment;
        if (!$resolvedPayment instanceof CourierShipmentPayment) {
            if ($this->relationLoaded('latestPayment')) {
                $relation = $this->getRelation('latestPayment');
            } elseif ($this->exists) {
                $relation = $this->latestPayment()->first();
            } else {
                $relation = null;
            }
            $resolvedPayment = $relation instanceof CourierShipmentPayment ? $relation : null;
        }

        if ($resolvedPayment instanceof CourierShipmentPayment) {
            $paymentStatus = (string) ($resolvedPayment->status ?: CourierShipmentPayment::STATUS_PENDING);
            $paymentMethod = (string) ($resolvedPayment->payment_method ?: CourierShipmentPayment::PAYMENT_METHOD_CARD);
            $paymentProvider = $resolvedPayment->provider ? (string) $resolvedPayment->provider : null;
            $paymentReference = (string) ($resolvedPayment->tx_reference
                ?: $resolvedPayment->gateway_payment_id
                ?: $resolvedPayment->gateway_order_id
                ?: '');
            $cardRequired = (bool) $resolvedPayment->is_required
                && $paymentMethod === CourierShipmentPayment::PAYMENT_METHOD_CARD;
        } else {
            $paymentMethod = $codFlowDetected
                ? CourierShipmentPayment::PAYMENT_METHOD_COD
                : 'pending';
            $paymentProvider = $paymentMethod === CourierShipmentPayment::PAYMENT_METHOD_COD ? CourierShipmentPayment::PAYMENT_METHOD_COD : null;
            $paymentReference = '';
            $cardRequired = false;

            if ($codFlowDetected) {
                $paymentStatus = $this->mapCodCollectionStatusToPaymentStatus((string) ($this->cod_collection_status ?? ''));
            } elseif ($this->status === self::STATUS_CANCELLED) {
                $paymentStatus = CourierShipmentPayment::STATUS_FAILED;
            } elseif ((float) ($this->estimated_cost ?? 0) <= 0 || $this->status === self::STATUS_PENDING) {
                $paymentStatus = CourierShipmentPayment::STATUS_PENDING;
            } else {
                $paymentStatus = CourierShipmentPayment::STATUS_PAID;
            }
        }

        return [
            'paymentStatus' => $paymentStatus,
            'paymentMethod' => $paymentMethod,
            'paymentProvider' => $paymentProvider,
            'paymentReference' => $paymentReference,
            'cardRequired' => $cardRequired,
            'lifecycleBlocked' => $cardRequired && $paymentStatus !== CourierShipmentPayment::STATUS_PAID,
            'codRequestedAmount' => $this->cod_requested_amount !== null ? (float) $this->cod_requested_amount : null,
            'codCollectedAmount' => $this->cod_collected_amount !== null ? (float) $this->cod_collected_amount : null,
            'codCollectionStatus' => $this->cod_collection_status !== null ? (string) $this->cod_collection_status : null,
            'codEnabled' => $codFlowDetected,
        ];
    }

    public function isCodFlowDetectedForDashboard(): bool
    {
        if ((bool) ($this->is_cod_enabled ?? false)) {
            return true;
        }

        if ($this->cod_requested_amount !== null && (float) $this->cod_requested_amount > 0) {
            return true;
        }

        if ($this->cod_collected_amount !== null && (float) $this->cod_collected_amount > 0) {
            return true;
        }

        if (is_string($this->cod_requested_method) && trim($this->cod_requested_method) !== '') {
            return true;
        }

        if (is_string($this->cod_collection_status) && trim($this->cod_collection_status) !== '') {
            return true;
        }

        return false;
    }

    private function mapCodCollectionStatusToPaymentStatus(string $codCollectionStatus): string
    {
        return match (strtolower(trim($codCollectionStatus))) {
            'collected', 'partially_collected' => CourierShipmentPayment::STATUS_PAID,
            'failed', 'refused' => CourierShipmentPayment::STATUS_FAILED,
            default => CourierShipmentPayment::STATUS_PENDING,
        };
    }

    public function isOperationsFrozen(): bool
    {
        return SuperAdminCourierActionAudit::isShipmentOperationsFrozen((int) $this->id);
    }
}
