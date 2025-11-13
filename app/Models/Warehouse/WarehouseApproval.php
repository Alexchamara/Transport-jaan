<?php

namespace App\Models\Warehouse;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class WarehouseApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'warehouse_unit_id',
        'status',
        'notes',
        'rejection_reason',
        'checklist',
        'reviewed_by',
        'reviewed_at',
        'approved_by',
        'approved_at',
        'expires_at',
        'metadata',
    ];

    protected $casts = [
        'checklist' => 'array',
        'metadata' => 'array',
        'reviewed_at' => 'datetime',
        'approved_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    // Relationships
    public function warehouseUnit()
    {
        return $this->belongsTo(WarehouseUnit::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Accessors
    public function getIsApprovedAttribute()
    {
        return $this->status === 'approved';
    }

    public function getIsRejectedAttribute()
    {
        return $this->status === 'rejected';
    }

    public function getIsPendingAttribute()
    {
        return in_array($this->status, ['pending', 'under_review']);
    }

    public function getIsExpiredAttribute()
    {
        return $this->expires_at && $this->expires_at < now();
    }

    public function getIsExpiringSoonAttribute()
    {
        return $this->expires_at && $this->expires_at < now()->addDays(30);
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['pending', 'under_review']);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'approved')
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    public function scopeExpired($query)
    {
        return $query->whereNotNull('expires_at')
                    ->where('expires_at', '<=', now());
    }

    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->whereNotNull('expires_at')
                    ->whereBetween('expires_at', [now(), now()->addDays($days)]);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeReviewedBy($query, $userId)
    {
        return $query->where('reviewed_by', $userId);
    }

    public function scopeApprovedBy($query, $userId)
    {
        return $query->where('approved_by', $userId);
    }
}