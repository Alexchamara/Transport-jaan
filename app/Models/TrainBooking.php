<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'train_schedule_id',
        'passenger_name',
        'passenger_email',
        'passenger_phone',
        'adults',
        'children',
        'infants',
        'total_passengers',
        'total_amount',
        'booking_reference',
        'status',
        'payment_status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function trainSchedule()
    {
        return $this->belongsTo(TrainSchedule::class);
    }

    public function train()
    {
        return $this->hasOneThrough(Train::class, TrainSchedule::class, 'id', 'id', 'train_schedule_id', 'train_id');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            if (empty($booking->booking_reference)) {
                $booking->booking_reference = 'TRN-' . strtoupper(uniqid());
            }
        });
    }
}
