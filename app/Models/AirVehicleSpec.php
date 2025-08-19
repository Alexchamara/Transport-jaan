<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AirVehicleSpec extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id', 'aircraft_type', 'icao_type_designator',
        'base_airport_iata', 'base_airport_icao',
        'seats', 'crew_required', 'range_km', 'mtow_kg',
        'cruising_speed_kts', 'fuel_type', 'flight_hours_total',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
