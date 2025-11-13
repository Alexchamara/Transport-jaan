<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VehicleCrew extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'user_id',
        'role',               // driver|pilot|captain|crew
        'license_number',
        'license_type',
        'license_expiry',
        'rating',
        'is_primary',
    ];

    protected $casts = [
        'license_expiry' => 'date',
        'rating'         => 'integer',
        'is_primary'     => 'boolean',
    ];

    public function vehicle() { return $this->belongsTo(Vehicle::class); }
    public function user()    { return $this->belongsTo(User::class); }
}
