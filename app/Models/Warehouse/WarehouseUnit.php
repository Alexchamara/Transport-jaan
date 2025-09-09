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
        'approved_at' => 'datetime',
    ];
}
