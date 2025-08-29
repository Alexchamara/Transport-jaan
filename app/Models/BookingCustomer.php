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

    public function booking() {
        return $this->belongsTo(Booking::class);
    }
}
