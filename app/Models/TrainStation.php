<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainStation extends Model
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
        return $this->hasMany(TrainSchedule::class, 'departure_station_id');
    }

    public function arrivalSchedules()
    {
        return $this->hasMany(TrainSchedule::class, 'arrival_station_id');
    }
}
