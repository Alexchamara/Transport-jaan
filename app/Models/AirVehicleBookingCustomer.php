<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AirVehicleBookingCustomer extends Model
{
    protected $table = 'air_vehicle_booking_customers';

    protected $fillable = [
        'air_vehicle_booking_id',
        'first_name','last_name','email','phone','country_code',
        'city','zip_code','age','address','notes',
    ];

    public function airVehicleBooking()
    {
        return $this->belongsTo(AirVehicleBookings::class, 'air_vehicle_booking_id');
    }
}
