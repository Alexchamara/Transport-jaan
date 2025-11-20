<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\SeaVehicleBookings;
use App\Models\Vehicle;

class SeaVehicleBookingAddon extends Model
{
    protected $table = 'sea_vehicle_booking_addons';

    protected $fillable = [
        'sea_vehicle_booking_id',
        'vehicle_id',
        'name',
        'price',
        'qty',
        'line_total',
    ];

    public function booking()
    {
        return $this->belongsTo(SeaVehicleBookings::class, 'sea_vehicle_booking_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }

}
