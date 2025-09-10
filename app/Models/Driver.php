<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'phone',
        'email',
        'license_no',
        'license_expiry',
        'vehicle_type',
        'vehicle_no',
        'status',
        'address',
        'notes',
    ];

    protected $casts = [
        'license_expiry' => 'date',
    ];
}
