<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\AirVehicleBookings;

class AirVehicleBookingSchedule extends Model
{
    protected $fillable = [
        'air_vehicle_booking_id',
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
        // Explicit foreign key to match the DB column added by the migration: air_vehicle_booking_id
        return $this->belongsTo(AirVehicleBookings::class, 'air_vehicle_booking_id');
    }
}