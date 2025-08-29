<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingAddon extends Model
{
    protected $fillable = ['booking_id','name','price','qty','line_total'];
    public function booking(){ return $this->belongsTo(Booking::class); }
}
