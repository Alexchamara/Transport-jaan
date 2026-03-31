<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierTemporaryAccessGrant extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_user_id',
        'service_workspace_id',
        'target_user_id',
        'requested_by_user_id',
        'approved_by_user_id',
        'rejected_by_user_id',
        'revoked_by_user_id',
        'grant_type',
        'elevated_role_name',
        'ticket_ref',
        'reason',
        'status',
        'duration_minutes',
        'starts_at',
        'expires_at',
        'approved_at',
        'rejected_at',
        'revoked_at',
        'grant_context',
    ];

    protected $casts = [
        'duration_minutes' => 'integer',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'revoked_at' => 'datetime',
        'grant_context' => 'array',
    ];

    public function targetUser()
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

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

    public function revoker()
    {
        return $this->belongsTo(User::class, 'revoked_by_user_id');
    }
}
