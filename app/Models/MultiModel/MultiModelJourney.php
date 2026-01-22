<?php

namespace App\Models\MultiModel;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class MultiModelJourney extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'reference',
        'status',
        'total_legs',
        'total_amount',
        'deposit_amount',
        'advance_amount',
        'payment_method',
        'payment_option',
        'amount_paid',
        'payment_status',
        'slip_number',
        'slip_path',
        'customer_data',
        'cancelled_at',
        'cancellation_reason',
        'cancelled_by',
    ];

    protected $casts = [
        'customer_data' => 'array',
        'total_amount' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'advance_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Get the user who made this journey booking
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all legs for this journey
     */
    public function legs()
    {
        return $this->hasMany(MultiModelLeg::class)->orderBy('leg_order');
    }

    /**
     * Get all bookings for this journey
     */
    public function bookings()
    {
        return $this->hasMany(MultiModelBooking::class);
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Get the full name from customer data
     */
    public function getCustomerFullNameAttribute()
    {
        $data = $this->customer_data ?? [];
        $firstName = $data['first_name'] ?? '';
        $lastName = $data['last_name'] ?? '';
        return trim("$firstName $lastName");
    }

    /**
     * Check if journey is cancellable
     */
    public function isCancellable()
    {
        return in_array($this->status, ['pending', 'confirmed']) && !$this->cancelled_at;
    }
}
