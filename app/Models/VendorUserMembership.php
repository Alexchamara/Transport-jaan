<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorUserMembership extends Model
{
    use HasFactory;

    protected $table = 'team_user_memberships';

    protected $fillable = [
        'vendor_user_id',
        'user_id',
        'membership_role',
        'status',
        'blocked_service_keys',
        'invited_by_user_id',
        'suspended_by_user_id',
        'suspended_at',
    ];

    protected $casts = [
        'blocked_service_keys' => 'array',
        'suspended_at' => 'datetime',
    ];

    public function vendorUser()
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function invitedBy()
    {
        return $this->belongsTo(User::class, 'invited_by_user_id');
    }

    public function suspendedBy()
    {
        return $this->belongsTo(User::class, 'suspended_by_user_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isBlockedForService(string $serviceKey): bool
    {
        $blocked = $this->blocked_service_keys ?? [];
        return in_array($serviceKey, $blocked, true);
    }
}
