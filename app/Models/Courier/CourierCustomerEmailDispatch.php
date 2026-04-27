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
        'event_type',
        'recipient_email',
        'recipient_kind',
        'status',
        'attempts',
        'dedupe_key',
        'payload',
        'last_error',
        'queued_at',
        'sent_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'queued_at' => 'datetime',
        'sent_at' => 'datetime',
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
}
