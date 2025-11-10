<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'bus_id',
        'departure_station_id',
        'arrival_station_id',
        'departure_time',
        'arrival_time',
        'duration_minutes',
        'date',
        'price',
        'available_seats',
        'is_expressway',
        'status'
    ];

    protected $casts = [
        'departure_time' => 'datetime:H:i:s',
        'arrival_time' => 'datetime:H:i:s', 
        'date' => 'date:Y-m-d',
        'is_expressway' => 'boolean',
    ];

    public function bus()
    {
        return $this->belongsTo(Bus::class);
    }

    public function departureStation()
    {
        return $this->belongsTo(BusStation::class, 'departure_station_id');
    }

    public function arrivalStation()
    {
        return $this->belongsTo(BusStation::class, 'arrival_station_id');
    }

    public function bookings()
    {
        return $this->hasMany(BusBooking::class);
    }

    public function getFormattedDurationAttribute()
    {
        $hours = intval($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;
        return $hours . 'h ' . $minutes . 'm';
    }
}
