<?php
// app/Models/SeaVehicleSpec.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeaVehicleSpec extends Model
{
    protected $fillable = [
        'vehicle_id',
        'vessel_type',
        'hull_material',
        'length_m',
        'beam_m',
        'draft_m',
        'engine_type',
        'engine_power_hp',
        'fuel_type',      // from request 'sea_fuel_type'
        'cabins',
        'berths',
        'toilets',
        'fuel_tank_l',
        'water_tank_l',
    ];

    protected $casts = [
        'length_m'       => 'decimal:2',
        'beam_m'         => 'decimal:2',
        'draft_m'        => 'decimal:2',
        'engine_power_hp'=> 'integer',
        'cabins'         => 'integer',
        'berths'         => 'integer',
        'toilets'        => 'integer',
        'fuel_tank_l'    => 'decimal:2',
        'water_tank_l'   => 'decimal:2',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
