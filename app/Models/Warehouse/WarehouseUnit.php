<?php

namespace App\Models\Warehouse;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WarehouseUnit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'address',
        'latitude',
        'longitude',
        'total_area',
        'capacity',
        'type',
        'pricing_model',
        'price',
        
        // Detailed Pricing
        'monthly_rate',
        'security_deposit',
        'setup_fee',
        'tax_rate',
        'total_amount',
        'tax_amount',
        'final_amount',
        
        'amenities',
        'images',
        'documents',
        'terms_conditions',
        'terms_pdf_path',
        'is_active',
        // approval
        'approval_status',
        'approved_at',
        'approved_by',
        'rejection_reason',
    ];

    protected $casts = [
        'amenities' => 'array',
        'images' => 'array',
        'documents' => 'array',
        'is_active' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
        'total_area' => 'float',
        'capacity' => 'float',
        'price' => 'float',
        
        // Detailed Pricing Casts
        'monthly_rate' => 'decimal:2',
        'security_deposit' => 'decimal:2',
        'setup_fee' => 'decimal:2',
        'tax_rate' => 'decimal:4',
        'total_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        
        'approved_at' => 'datetime',
    ];
}
