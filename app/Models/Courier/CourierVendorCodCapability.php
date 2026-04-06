<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierVendorCodCapability extends Model
{
    use HasFactory;

    public const CATEGORY_DOMESTIC = 'domestic';
    public const CATEGORY_INTERNATIONAL = 'international';

    public const CATEGORY_LABELS = [
        self::CATEGORY_DOMESTIC => 'Domestic',
        self::CATEGORY_INTERNATIONAL => 'International',
    ];

    public const STATUS_NOT_REQUESTED = 'not_requested';
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    public const STATUS_LABELS = [
        self::STATUS_NOT_REQUESTED => 'Not Requested',
        self::STATUS_PENDING => 'Pending Review',
        self::STATUS_APPROVED => 'Approved',
        self::STATUS_REJECTED => 'Rejected',
    ];

    protected $fillable = [
        'vendor_user_id',
        'service_workspace_id',
        'category',
        'requested_by_user_id',
        'status',
        'requested_at',
        'requested_note',
        'reviewed_at',
        'reviewed_by_user_id',
        'approved_at',
        'expires_at',
        'decision_reason',
        'metadata',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'approved_at' => 'datetime',
        'expires_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }

    public function audits()
    {
        return $this->hasMany(CourierVendorCodCapabilityAudit::class, 'courier_vendor_cod_capability_id');
    }

    public function categoryLabel(): string
    {
        return self::CATEGORY_LABELS[self::normalizeCategory((string) $this->category)] ?? 'Domestic';
    }

    public static function normalizeCategory(?string $category): string
    {
        $normalized = strtolower(trim((string) $category));

        // Keep backward compatibility with legacy "logistic" naming.
        if ($normalized === 'logistic') {
            $normalized = self::CATEGORY_INTERNATIONAL;
        }

        if (!in_array($normalized, [self::CATEGORY_DOMESTIC, self::CATEGORY_INTERNATIONAL], true)) {
            return self::CATEGORY_DOMESTIC;
        }

        return $normalized;
    }

    public function statusLabel(): string
    {
        return self::STATUS_LABELS[$this->status] ?? 'Unknown';
    }
}
