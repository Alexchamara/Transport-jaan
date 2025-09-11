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
        'booking_reference',
        'status',
        
        // Company Information
        'company_name',
        'contact_person',
        'phone',
        'email',
        'company_address',
        
        // Storage Requirements
        'storage_type',
        'required_space',
        'goods_type',
        'goods_description',
        'estimated_weight',
        'special_requirements',
        'amenities',
        
        // Duration & Scheduling
        'start_date',
        'end_date',
        'duration_months',
        'access_hours',
        'special_instructions',
        
        // Pricing
        'monthly_rate',
        'security_deposit',
        'setup_fee',
        'total_amount',
        'tax_amount',
        'final_amount',
        
        // Payment Information
        'payment_method',
        'payment_status',
        'payment_date',
        'transaction_reference',
        'payment_option',
        'payment_reference',
        
        // Additional Fields
        'terms_accepted',
        'insurance_required',
        'notes',
        'documents',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'payment_date' => 'datetime',
        'terms_accepted' => 'boolean',
        'insurance_required' => 'boolean',
        'required_space' => 'decimal:2',
        'estimated_weight' => 'decimal:2',
        'monthly_rate' => 'decimal:2',
        'security_deposit' => 'decimal:2',
        'setup_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'special_requirements' => 'json',
        'amenities' => 'json',
        'documents' => 'json',
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
               $this->start_date > now()->addDays(1);
    }
}