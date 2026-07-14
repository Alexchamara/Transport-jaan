<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingCustomer extends Model
{
    protected $fillable = [
        'booking_id',
        'first_name','last_name','email','phone','country_code',
        'city','zip_code','age',
    ];

    public function getFullNameAttribute(): string
    {
        return trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? '')) ?: 'Customer';
    }

    public function booking() {
        return $this->belongsTo(Booking::class);
    }
}
