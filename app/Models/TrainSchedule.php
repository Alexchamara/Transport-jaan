<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'train_id',
        'departure_station_id',
        'arrival_station_id',
        'departure_time',
        'arrival_time',
        'duration_minutes',
        'date',
        'price',
        'available_seats',
        'status'
    ];

    protected $casts = [
        'departure_time' => 'datetime:H:i',
        'arrival_time' => 'datetime:H:i',
        'date' => 'date',
    ];

    public function train()
    {
        return $this->belongsTo(Train::class);
    }

    public function departureStation()
    {
        return $this->belongsTo(TrainStation::class, 'departure_station_id');
    }

    public function arrivalStation()
    {
        return $this->belongsTo(TrainStation::class, 'arrival_station_id');
    }

    public function bookings()
    {
        return $this->hasMany(TrainBooking::class);
    }
}
