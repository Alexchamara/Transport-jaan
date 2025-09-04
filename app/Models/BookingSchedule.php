<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingSchedule extends Model
{
    protected $fillable = [
        'booking_id',
        'pickup_at',
        'dropoff_at',
        'pickup_location',
        'dropoff_location',
    ];

    protected $casts = [
        'pickup_at'  => 'datetime',
        'dropoff_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
