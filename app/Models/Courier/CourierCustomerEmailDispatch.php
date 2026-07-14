<?php

namespace App\Models\Courier;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourierCustomerEmailDispatch extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_SENT = 'sent';
    public const STATUS_FAILED = 'failed';
    public const STATUS_SKIPPED = 'skipped';

    protected $fillable = [
        'shipment_id',
        'payment_id',
        'tracking_event_id',
        'vendor_user_id',
        'event_type',
        'channel',
        'recipient_email',
        'recipient_kind',
        'recipient_user_id',
        'status',
        'attempts',
        'dedupe_key',
        'payload',
        'last_error',
        'queued_at',
        'sent_at',
        'provider_message_id',
        'provider_event',
        'failed_reason_code',
        'provider_event_at',
        'delivery_meta',
    ];

    protected $casts = [
        'payload' => 'array',
        'delivery_meta' => 'array',
        'queued_at' => 'datetime',
        'sent_at' => 'datetime',
        'provider_event_at' => 'datetime',
        'attempts' => 'integer',
    ];

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(CourierShipment::class, 'shipment_id');
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(CourierShipmentPayment::class, 'payment_id');
    }

    public function trackingEvent(): BelongsTo
    {
        return $this->belongsTo(CourierTrackingEvent::class, 'tracking_event_id');
    }

    public function recipientUser(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'recipient_user_id');
    }
}
