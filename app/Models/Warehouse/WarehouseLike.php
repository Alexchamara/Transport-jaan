<?php

namespace App\Models\Warehouse;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class WarehouseLike extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'warehouse_unit_id'
    ];

    // Relationships
    public function warehouseUnit()
    {
        return $this->belongsTo(WarehouseUnit::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByWarehouse($query, $warehouseId)
    {
        return $query->where('warehouse_unit_id', $warehouseId);
    }
}