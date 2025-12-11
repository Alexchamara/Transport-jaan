<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\BookingReferenceGenerator;

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
        'payment_status',
        'booking_date',
        'expires_at'
    ];

    protected $casts = [
        'seat_numbers' => 'array',
        'booking_date' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function busSchedule()
    {
        return $this->belongsTo(BusSchedule::class);
    }

    /**
     * Generate secure booking reference
     * @deprecated Use BookingReferenceGenerator::forBus() instead
     */
    public static function generateBookingReference()
    {
        return BookingReferenceGenerator::forBus();
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            if (empty($booking->booking_reference)) {
                $booking->booking_reference = BookingReferenceGenerator::forBus();
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
