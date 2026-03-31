<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierSensitiveActionApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_user_id',
        'service_workspace_id',
        'action_key',
        'resource_type',
        'resource_id',
        'request_signature',
        'requested_by_user_id',
        'required_approvals',
        'approved_count',
        'approver_user_ids',
        'amount',
        'threshold_level',
        'status',
        'reason',
        'context',
        'expires_at',
        'approved_at',
        'rejected_at',
        'executed_at',
        'approved_by_user_id',
        'rejected_by_user_id',
    ];

    protected $casts = [
        'approver_user_ids' => 'array',
        'context' => 'array',
        'amount' => 'decimal:2',
        'expires_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'executed_at' => 'datetime',
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function rejector()
    {
        return $this->belongsTo(User::class, 'rejected_by_user_id');
    }
}
