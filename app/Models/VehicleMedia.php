<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VehicleMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id', 'media_type', 'title', 'path', 'is_primary', 'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'bool',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
