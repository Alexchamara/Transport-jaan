<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlightBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'special_requests',
        'trip_type',
        'departure_date',
        'return_date',
        'departure_airport',
        'arriving_airport',
        'status',
    ];

    protected $casts = [
        'departure_date' => 'date',
        'return_date' => 'date',
    ];

    protected $attributes = [
        'status' => 'pending',
    ];
}
