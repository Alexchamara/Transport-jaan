<?php

namespace App\Models\Courier;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierEmailSuppression extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_user_id',
        'email',
        'reason',
        'source',
        'provider_event',
        'provider_message_id',
        'metadata',
        'suppressed_at',
        'expires_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'suppressed_at' => 'datetime',
        'expires_at' => 'datetime',
    ];
}

