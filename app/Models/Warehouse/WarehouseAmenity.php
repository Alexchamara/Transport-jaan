<?php

namespace App\Models\Warehouse;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WarehouseAmenity extends Model
{
    use HasFactory;

    protected $fillable = [
        'warehouse_unit_id',
        'name',
        'description',
        'is_included',
        'additional_cost',
        'cost_frequency',
        'is_available',
    ];

    protected $casts = [
        'is_included' => 'boolean',
        'is_available' => 'boolean',
        'additional_cost' => 'decimal:2',
    ];

    // Relationships
    public function warehouseUnit()
    {
        return $this->belongsTo(WarehouseUnit::class);
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeIncluded($query)
    {
        return $query->where('is_included', true);
    }

    public function scopeWithCost($query)
    {
        return $query->where('is_included', false)->whereNotNull('additional_cost');
    }
}