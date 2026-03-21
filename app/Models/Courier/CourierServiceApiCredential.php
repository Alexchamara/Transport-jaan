<?php

namespace App\Models\Courier;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierServiceApiCredential extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_REVOKED = 'revoked';
    public const STATUS_EXPIRED = 'expired';

    protected $fillable = [
        'vendor_user_id',
        'service_workspace_id',
        'created_by_user_id',
        'revoked_by_user_id',
        'rotated_from_id',
        'credential_name',
        'service_account_code',
        'role_name',
        'permission_scopes',
        'webhook_scopes',
        'key_prefix',
        'key_hash',
        'status',
        'last_used_at',
        'expires_at',
        'revoked_at',
        'policy_snapshot',
        'metadata',
    ];

    protected $casts = [
        'permission_scopes' => 'array',
        'webhook_scopes' => 'array',
        'policy_snapshot' => 'array',
        'metadata' => 'array',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];
}
