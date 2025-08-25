<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AirVehicleSpec extends Model
{
    protected $guarded = [];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
