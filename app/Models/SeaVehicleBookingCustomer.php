<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeaVehicleBookingCustomer extends Model
{
    protected $table = 'sea_vehicle_booking_customers';

    protected $fillable = [
        'sea_vehicle_booking_id',
        'first_name','last_name','email','phone','country_code',
        'city','zip_code','age','address','notes',
    ];

    public function seaVehicleBooking()
    {
        return $this->belongsTo(SeaVehicleBookings::class, 'sea_vehicle_booking_id');
    }
}
