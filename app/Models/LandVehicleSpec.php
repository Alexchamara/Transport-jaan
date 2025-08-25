<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LandVehicleSpec extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id', 'body_type', 'fuel_type', 'transmission_type',
        'gears', 'seats', 'doors', 'fuel_tank_capacity_l',
    ];

    protected $casts = [
        'fuel_tank_capacity_l' => 'decimal:2',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
