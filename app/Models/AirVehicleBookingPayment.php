<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AirVehicleBookingPayment extends Model
{
    protected $table = 'air_vehicle_booking_payments';

    protected $fillable = [
        'air_vehicle_booking_id','method','option','amount_paid','status',
        'slip_number','slip_path','tx_reference',
    ];

    protected $casts = [
        'amount_paid' => 'float',
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
    ];

    public function airVehicleBooking()
    {
        return $this->belongsTo(AirVehicleBookings::class, 'air_vehicle_booking_id');
    }
}
