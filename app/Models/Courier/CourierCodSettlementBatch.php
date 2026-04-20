<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class CourierCodSettlementBatch extends Model
{
    use HasFactory;

    public const CATEGORY_ALL = 'all';
    public const CATEGORY_DOMESTIC = 'domestic';
    public const CATEGORY_INTERNATIONAL = 'international';

    public const STATUS_DRAFT = 'draft';
    public const STATUS_RECONCILING = 'reconciling';
    public const STATUS_READY_FOR_PAYOUT = 'ready_for_payout';
    public const STATUS_EXPORTED = 'exported';
    public const STATUS_CLOSED = 'closed';

    public const RECON_STATUS_BALANCED = 'balanced';
    public const RECON_STATUS_ISSUES_DETECTED = 'issues_detected';
    public const RECON_STATUS_DISPUTE_OPEN = 'dispute_open';
    public const RECON_STATUS_FINALIZED = 'finalized';

    public const STATUS_LABELS = [
        self::STATUS_DRAFT => 'Draft',
        self::STATUS_RECONCILING => 'Reconciling',
        self::STATUS_READY_FOR_PAYOUT => 'Ready For Payout',
        self::STATUS_EXPORTED => 'Exported',
        self::STATUS_CLOSED => 'Closed',
    ];

    public const RECON_STATUS_LABELS = [
        self::RECON_STATUS_BALANCED => 'Balanced',
        self::RECON_STATUS_ISSUES_DETECTED => 'Issues Detected',
        self::RECON_STATUS_DISPUTE_OPEN => 'Dispute Open',
        self::RECON_STATUS_FINALIZED => 'Finalized',
    ];

    protected $fillable = [
        'batch_reference',
        'category',
        'status',
        'reconciliation_status',
        'currency_code',
        'cycle_start_date',
        'cycle_end_date',
        'shipment_count',
        'gross_cod_amount',
        'reserve_amount',
        'net_payout_amount',
        'discrepancy_amount',
        'generated_by_user_id',
        'reconciled_by_user_id',
        'exported_by_user_id',
        'generated_at',
        'reconciled_at',
        'exported_at',
        'metadata',
    ];

    protected $casts = [
        'cycle_start_date' => 'date',
        'cycle_end_date' => 'date',
        'shipment_count' => 'integer',
        'gross_cod_amount' => 'decimal:2',
        'reserve_amount' => 'decimal:2',
        'net_payout_amount' => 'decimal:2',
        'discrepancy_amount' => 'decimal:2',
        'generated_at' => 'datetime',
        'reconciled_at' => 'datetime',
        'exported_at' => 'datetime',
        'metadata' => 'array',
    ];

    public static function generateReference(): string
    {
        return 'COD-BAT-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(4));
    }

    public function lines(): HasMany
    {
        return $this->hasMany(CourierCodSettlementLine::class, 'courier_cod_settlement_batch_id');
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by_user_id');
    }

    public function reconciledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reconciled_by_user_id');
    }

    public function exportedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'exported_by_user_id');
    }

    public function statusLabel(): string
    {
        return self::STATUS_LABELS[$this->status] ?? 'Unknown';
    }

    public function reconciliationStatusLabel(): string
    {
        return self::RECON_STATUS_LABELS[$this->reconciliation_status] ?? 'Unknown';
    }
}
