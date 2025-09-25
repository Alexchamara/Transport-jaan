<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusStation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'city',
        'province',
        'latitude',
        'longitude',
        'status'
    ];

    public function departureSchedules()
    {
        return $this->hasMany(BusSchedule::class, 'departure_station_id');
    }

    public function arrivalSchedules()
    {
        return $this->hasMany(BusSchedule::class, 'arrival_station_id');
    }
}
{
    //
}
