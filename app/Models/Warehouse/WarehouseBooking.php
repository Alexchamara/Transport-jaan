<?php

namespace App\Models\Warehouse;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class WarehouseBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'warehouse_unit_id',
        'company_name',
        'contact_person',
        'email',
        'phone',
        'storage_type',
        'required_space',
        'storage_duration',
        'move_in_date',
        'move_in_time',
        'move_out_date',
        'move_out_time',
        'goods_description',
        'special_handling',
        'access_frequency',
        'climate_controlled',
        'insurance_required',
        'special_requirements',
        'status',
        'booking_date',
        'total_amount',
        'payment_status',
    ];

    protected $casts = [
        'move_in_date' => 'date',
        'move_out_date' => 'date',
        'booking_date' => 'datetime',
        'climate_controlled' => 'boolean',
        'insurance_required' => 'boolean',
        'required_space' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the user that owns the booking
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the warehouse unit that is booked
     */
    public function warehouseUnit()
    {
        return $this->belongsTo(WarehouseUnit::class);
    }

    /**
     * Get the formatted status
     */
    public function getFormattedStatusAttribute()
    {
        return ucfirst($this->status);
    }

    /**
     * Check if booking is active
     */
    public function isActive()
    {
        return in_array($this->status, ['confirmed', 'active']);
    }

    /**
     * Check if booking can be cancelled
     */
    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'confirmed']) && 
               $this->move_in_date > now()->addDays(1);
    }
}