<?php

namespace App\Models\Courier;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use LogicException;

class CourierTeamSecurityAudit extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'vendor_user_id',
        'service_workspace_id',
        'actor_user_id',
        'event_type',
        'event_family',
        'target_type',
        'target_id',
        'route_name',
        'ip_address',
        'user_agent',
        'status_code',
        'before_snapshot',
        'after_snapshot',
        'snapshot_diff',
        'metadata',
        'is_alert',
        'alert_code',
        'previous_hash',
        'record_hash',
        'created_at',
    ];

    protected $casts = [
        'before_snapshot' => 'array',
        'after_snapshot' => 'array',
        'snapshot_diff' => 'array',
        'metadata' => 'array',
        'is_alert' => 'boolean',
        'created_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::updating(function () {
            throw new LogicException('CourierTeamSecurityAudit records are immutable and cannot be updated.');
        });

        static::deleting(function () {
            throw new LogicException('CourierTeamSecurityAudit records are immutable and cannot be deleted.');
        });
    }
}
