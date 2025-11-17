<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeaVehicleBookingPayment extends Model
{
    protected $table = 'sea_vehicle_booking_payments';

    protected $fillable = [
        'sea_vehicle_booking_id',
        'method',
        'option',
        'amount_paid',
        'status',
        'slip_number',
        'slip_path',
        'tx_reference',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
        'amount_paid' => 'float',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(SeaVehicleBookings::class, 'sea_vehicle_booking_id');
    }
}
