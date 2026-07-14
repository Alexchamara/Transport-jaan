<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Train extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'train_number',
        'class_type',
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
        return $this->hasMany(TrainSchedule::class);
    }

    public function bookings()
    {
        return $this->hasMany(TrainBooking::class);
    }
}
