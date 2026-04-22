<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourierCodSettlementLine extends Model
{
    use HasFactory;

    public const STATUS_PENDING_RECONCILIATION = 'pending_reconciliation';
    public const STATUS_PAYOUT_READY = 'payout_ready';
    public const STATUS_DISPUTED = 'disputed';
    public const STATUS_WITHHELD = 'withheld';

    public const DISPUTE_STATUS_OPEN = 'open';
    public const DISPUTE_STATUS_RESOLVED = 'resolved';
    public const DISPUTE_STATUS_REJECTED = 'rejected';
    public const HANDOVER_STATUS_RECORDED = 'recorded';
    public const HANDOVER_STATUS_VERIFIED = 'verified';
    public const HANDOVER_STATUS_DISPUTED = 'disputed';
    public const HANDOVER_STATUS_SETTLED = 'settled';

    public const STATUS_LABELS = [
        self::STATUS_PENDING_RECONCILIATION => 'Pending Reconciliation',
        self::STATUS_PAYOUT_READY => 'Payout Ready',
        self::STATUS_DISPUTED => 'Disputed',
        self::STATUS_WITHHELD => 'Withheld',
    ];

    public const DISPUTE_STATUS_LABELS = [
        self::DISPUTE_STATUS_OPEN => 'Open',
        self::DISPUTE_STATUS_RESOLVED => 'Resolved',
        self::DISPUTE_STATUS_REJECTED => 'Rejected',
    ];

    protected $fillable = [
        'courier_cod_settlement_batch_id',
        'shipment_id',
        'vendor_user_id',
        'cod_capability_id',
        'line_status',
        'handover_status',
        'handover_recorded_at',
        'handover_recorded_by_user_id',
        'handover_verified_at',
        'handover_verified_by_user_id',
        'settlement_cycle_mode',
        'currency_code',
        'requested_cod_amount',
        'collected_cod_amount',
        'reserve_amount',
        'payout_amount',
        'discrepancy_amount',
        'dispute_status',
        'dispute_reason',
        'dispute_note',
        'reconciled_by_user_id',
        'reconciled_at',
        'metadata',
    ];

    protected $casts = [
        'requested_cod_amount' => 'decimal:2',
        'collected_cod_amount' => 'decimal:2',
        'reserve_amount' => 'decimal:2',
        'payout_amount' => 'decimal:2',
        'discrepancy_amount' => 'decimal:2',
        'handover_recorded_at' => 'datetime',
        'handover_verified_at' => 'datetime',
        'reconciled_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(CourierCodSettlementBatch::class, 'courier_cod_settlement_batch_id');
    }

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(CourierShipment::class, 'shipment_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    public function capability(): BelongsTo
    {
        return $this->belongsTo(CourierVendorCodCapability::class, 'cod_capability_id');
    }

    public function reconciledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reconciled_by_user_id');
    }

    public function handoverRecordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handover_recorded_by_user_id');
    }

    public function handoverVerifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handover_verified_by_user_id');
    }

    public function lineStatusLabel(): string
    {
        return self::STATUS_LABELS[$this->line_status] ?? 'Unknown';
    }

    public function disputeStatusLabel(): ?string
    {
        if ($this->dispute_status === null) {
            return null;
        }

        return self::DISPUTE_STATUS_LABELS[$this->dispute_status] ?? 'Unknown';
    }
}
