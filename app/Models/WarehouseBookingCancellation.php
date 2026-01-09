<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Warehouse\WarehouseBooking;
use App\Models\User;

class WarehouseBookingCancellation extends Model
{
    use HasFactory;

    protected $fillable = [
        'warehouse_booking_id',
        'user_id',
        'cancelled_by',
        'cancellation_reason',
        'booking_start_date',
        'cancellation_date',
        'days_before_booking',
        'allowed_cancellation_days',
        'refund_percentage',
        'original_amount',
        'refund_amount',
        'refund_status',
        'refund_processed_at',
    ];

    protected $casts = [
        'booking_start_date' => 'date',
        'cancellation_date' => 'date',
        'days_before_booking' => 'integer',
        'allowed_cancellation_days' => 'integer',
        'refund_percentage' => 'decimal:2',
        'original_amount' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'refund_processed_at' => 'datetime',
    ];

    /**
     * Get the warehouse booking that was cancelled
     */
    public function warehouseBooking()
    {
        return $this->belongsTo(WarehouseBooking::class);
    }

    /**
     * Get the user who cancelled the booking
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
