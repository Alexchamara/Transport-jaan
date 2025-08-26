<?php
// app/Models/VehicleCrew.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleCrew extends Model
{
    protected $fillable = [
        'vehicle_id',
        'user_id',
        'role',             // optional: captain/driver/etc (if you have it)
        'license_number',   // optional (if exists)
        'license_expiry',
        'is_primary',
    ];

    protected $casts = [
        'license_expiry' => 'date',
        'is_primary'     => 'boolean',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
