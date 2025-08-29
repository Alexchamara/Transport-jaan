<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingPayment extends Model
{
    protected $fillable = [
        'booking_id','method','option','amount_paid','status',
        'slip_number','slip_path','tx_reference',
    ];

    public function booking(){ return $this->belongsTo(Booking::class); }
}
