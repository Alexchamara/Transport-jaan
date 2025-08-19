<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VehicleCrew extends Model
{
    use HasFactory;

    protected $table = 'vehicle_crews';

    protected $fillable = [
        'vehicle_id', 'user_id', 'role',
        'license_number', 'license_type', 'license_expiry', 'rating',
    ];

    protected $casts = [
        'license_expiry' => 'date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
