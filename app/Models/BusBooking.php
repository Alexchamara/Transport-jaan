<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bus_schedule_id',
        'passenger_name',
        'passenger_email',
        'passenger_phone',
        'seat_numbers',
        'passenger_count',
        'total_price',
        'booking_reference',
        'status',
        'booking_date'
    ];

    protected $casts = [
        'seat_numbers' => 'array',
        'booking_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function busSchedule()
    {
        return $this->belongsTo(BusSchedule::class);
    }

    public static function generateBookingReference()
    {
        return 'BUS-' . strtoupper(uniqid());
    }
}
