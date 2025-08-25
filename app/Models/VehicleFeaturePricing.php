<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleFeaturePricing extends Model
{
    use HasFactory;

    protected $table = 'vehicle_feature_pricings';

    protected $fillable = [
        'vehicle_id',
        'additional_feature_name',
        'additional_feature_price',
    ];

    protected $casts = [
        // requires Laravel that supports decimal casting; if not, you can cast to string
        'additional_feature_price' => 'decimal:2',
    ];

    /* ---------------- Relationships ---------------- */

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    /* ---------------- Scopes (optional) ---------------- */

    public function scopeForVehicle($query, int $vehicleId)
    {
        return $query->where('vehicle_id', $vehicleId);
    }
}
