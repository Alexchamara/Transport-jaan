<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commission extends Model
{
    protected $fillable = [
        'service_type',
        'commission_percentage',
        'fixed_amount',
        'description',
        'is_active',
    ];

    protected $casts = [
        'commission_percentage' => 'decimal:2',
        'fixed_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const SERVICE_TYPES = [
        'vehicle' => 'Vehicle Bookings',
        'warehouse' => 'Warehouse Bookings',
        'courier' => 'Courier Service',
        'freight' => 'Freight Service',
        'ticket' => 'Ticket Booking',
    ];

    public static function getServiceTypes()
    {
        return self::SERVICE_TYPES;
    }

    public function getServiceNameAttribute()
    {
        return self::SERVICE_TYPES[$this->service_type] ?? $this->service_type;
    }
}

