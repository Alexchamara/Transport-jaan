<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierTrustedDevice extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_user_id',
        'service_workspace_id',
        'user_id',
        'device_hash',
        'device_label',
        'last_ip_address',
        'last_ip_prefix',
        'trusted_at',
        'last_seen_at',
        'expires_at',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'trusted_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
