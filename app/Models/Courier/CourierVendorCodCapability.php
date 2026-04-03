<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierVendorCodCapability extends Model
{
    use HasFactory;

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
        'requested_by_user_id',
        'status',
        'requested_at',
        'requested_note',
        'reviewed_at',
        'reviewed_by_user_id',
        'approved_at',
        'decision_reason',
        'metadata',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'approved_at' => 'datetime',
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

    public function statusLabel(): string
    {
        return self::STATUS_LABELS[$this->status] ?? 'Unknown';
    }
}
