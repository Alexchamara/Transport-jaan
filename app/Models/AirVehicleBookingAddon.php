<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\AirVehicleBookings;
use App\Models\Vehicle;

class AirVehicleBookingAddon extends Model
{
    protected $table = 'air_vehicle_booking_addons';

    protected $fillable = [
        'air_vehicle_booking_id',
        'vehicle_id',
        'name',
        'price',
        'qty',
        'line_total',
    ];

    public function booking()
    {
        // Relates to the AirVehicleBookings model using the explicit FK.
        return $this->belongsTo(AirVehicleBookings::class, 'air_vehicle_booking_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }

}
