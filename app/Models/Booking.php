<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'client_id',
        'vehicle_id',
        'status',
        'price_per_day',
        'rental_days',
        'addons_total',
        'subtotal',
        'deposit_amount',
        'advance_amount',
        'total_amount',
        'currency',
        'addons_snapshot',
        'vehicle_snapshot',
        'notes',
    ];

    protected $casts = [
        'addons_snapshot' => 'array',
        'vehicle_snapshot' => 'array',

        // ▼ NEW: ensure numbers go to the frontend as numbers
        'price_per_day' => 'float',
        'addons_total' => 'float',
        'subtotal' => 'float',
        'deposit_amount' => 'float',
        'advance_amount' => 'float',
        'total_amount' => 'float',
        'rental_days' => 'integer',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
    public function schedule()
    {
        return $this->hasOne(BookingSchedule::class);
    }
    public function addons()
    {
        return $this->hasMany(BookingAddon::class);
    }
    public function payments()
    {
        return $this->hasMany(BookingPayment::class);
    }

    public function customer()
    {
        return $this->hasOne(\App\Models\BookingCustomer::class);
    }

}
