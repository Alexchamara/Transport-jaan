<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\AirVehicleBookings;

class AirVehicleBookingSchedule extends Model
{
    protected $fillable = [
        'booking_id',
        'pickup_at',
        'dropoff_at',
        'pickup_location',
        'dropoff_location',
    ];

    protected $casts = [
        'pickup_at'  => 'datetime',
        'dropoff_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

public function airVehicleBooking()
    {
        return $this->belongsTo(AirVehicleBookings::class);
    }
}