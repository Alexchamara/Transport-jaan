<?php
// app/Models/AirVehicleSpec.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AirVehicleSpec extends Model
{
    protected $fillable = [
        'vehicle_id',
        'aircraft_type',
        'icao_type_designator',
        'base_airport_iata',
        'base_airport_icao',
        'seats',
        'crew_required',
        'range_km',
        'mtow_kg',
        'cruising_speed_kts',
        'fuel_type',            // from request 'air_fuel_type'
        'flight_hours_total',
    ];

    protected $casts = [
        'seats'               => 'integer',
        'crew_required'       => 'integer',
        'range_km'            => 'integer',
        'mtow_kg'             => 'integer',
        'cruising_speed_kts'  => 'integer',
        'flight_hours_total'  => 'integer',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
