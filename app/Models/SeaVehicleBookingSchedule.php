<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\SeaVehicleBookings;

class SeaVehicleBookingSchedule extends Model
{
    protected $fillable = [
        'sea_vehicle_booking_id',
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

    public function seaVehicleBooking()
    {
        // Explicit foreign key to match the DB column: sea_vehicle_booking_id
        return $this->belongsTo(SeaVehicleBookings::class, 'sea_vehicle_booking_id');
    }
}
