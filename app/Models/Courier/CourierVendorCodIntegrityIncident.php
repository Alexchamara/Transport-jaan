<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class CourierVendorCodIntegrityIncident extends Model
{
    use HasFactory;

    public const STATUS_OPEN = 'open';
    public const STATUS_INVESTIGATING = 'investigating';
    public const STATUS_RESOLVED = 'resolved';
    public const STATUS_DISMISSED = 'dismissed';

    public const STATUSES_ACTIVE = [
        self::STATUS_OPEN,
        self::STATUS_INVESTIGATING,
    ];

    public const STATUS_LABELS = [
        self::STATUS_OPEN => 'Open',
        self::STATUS_INVESTIGATING => 'Investigating',
        self::STATUS_RESOLVED => 'Resolved',
        self::STATUS_DISMISSED => 'Dismissed',
    ];

    public const SEVERITY_LOW = 'low';
    public const SEVERITY_MEDIUM = 'medium';
    public const SEVERITY_HIGH = 'high';
    public const SEVERITY_CRITICAL = 'critical';

    public const SEVERITY_LABELS = [
        self::SEVERITY_LOW => 'Low',
        self::SEVERITY_MEDIUM => 'Medium',
        self::SEVERITY_HIGH => 'High',
        self::SEVERITY_CRITICAL => 'Critical',
    ];

    protected $fillable = [
        'courier_vendor_cod_capability_id',
        'vendor_user_id',
        'category',
        'status',
        'severity',
        'title',
        'description',
        'detected_issue_count',
        'integrity_snapshot',
        'detected_at',
        'created_by_user_id',
        'assigned_to_user_id',
        'assigned_at',
        'resolved_by_user_id',
        'resolved_at',
        'resolution_note',
        'metadata',
    ];

    protected $casts = [
        'detected_issue_count' => 'integer',
        'integrity_snapshot' => 'array',
        'metadata' => 'array',
        'detected_at' => 'datetime',
        'assigned_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function capability()
    {
        return $this->belongsTo(CourierVendorCodCapability::class, 'courier_vendor_cod_capability_id');
    }

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by_user_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', self::STATUSES_ACTIVE);
    }

    public static function normalizeStatus(?string $status): string
    {
        $normalized = strtolower(trim((string) $status));

        if (!in_array($normalized, array_keys(self::STATUS_LABELS), true)) {
            return self::STATUS_OPEN;
        }

        return $normalized;
    }

    public static function normalizeSeverity(?string $severity): string
    {
        $normalized = strtolower(trim((string) $severity));

        if (!in_array($normalized, array_keys(self::SEVERITY_LABELS), true)) {
            return self::SEVERITY_HIGH;
        }

        return $normalized;
    }

    public function statusLabel(): string
    {
        return self::STATUS_LABELS[self::normalizeStatus((string) $this->status)] ?? 'Open';
    }

    public function severityLabel(): string
    {
        return self::SEVERITY_LABELS[self::normalizeSeverity((string) $this->severity)] ?? 'High';
    }
}
