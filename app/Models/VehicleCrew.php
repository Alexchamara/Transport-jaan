<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleCrew extends Model
{
    protected $guarded = [];

    protected $casts = [
        'license_expiry' => 'date',
        'is_primary'     => 'boolean',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
