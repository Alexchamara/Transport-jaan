<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeaVehicleSpec extends Model
{
    protected $guarded = [];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
