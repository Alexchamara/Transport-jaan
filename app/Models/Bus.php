<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bus extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'bus_number',
        'bus_type',
        'route_number',
        'facilities',
        'capacity',
        'operator',
        'status'
    ];

    protected $casts = [
        'facilities' => 'array',
    ];

    public function schedules()
    {
        return $this->hasMany(BusSchedule::class);
    }

    public function bookings()
    {
        return $this->hasManyThrough(BusBooking::class, BusSchedule::class);
    }
}
