<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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
}
