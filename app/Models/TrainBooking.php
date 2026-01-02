<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\BookingReferenceGenerator;

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
        'seat_numbers',
        'total_amount',
        'booking_reference',
        'status',
        'payment_status',
        'expires_at',
        'cancelled_at',
        'cancellation_reason',
        'refund_amount',
        'cancellation_fee'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'seat_numbers' => 'array',
        'cancelled_at' => 'datetime',
        'refund_amount' => 'decimal:2',
        'cancellation_fee' => 'decimal:2',
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
                $booking->booking_reference = BookingReferenceGenerator::forTrain();
            }
        });
    }

    /**
     * Check if the booking has expired
     */
    public function isExpired(): bool
    {
        if (!$this->expires_at) {
            return false;
        }

        return $this->expires_at->isPast() && 
               $this->status === 'pending' && 
               $this->payment_status === 'pending';
    }

    /**
     * Scope to get expired bookings
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now())
                    ->where('status', 'pending')
                    ->where('payment_status', 'pending');
    }

    /**
     * Scope to get active (non-expired) bookings
     */
    public function scopeActive($query)
    {
        return $query->where(function($q) {
            $q->where('expires_at', '>', now())
              ->orWhereNull('expires_at')
              ->orWhere('status', '!=', 'pending')
              ->orWhere('payment_status', 'paid');
        });
    }
}
