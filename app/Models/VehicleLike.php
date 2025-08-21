<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleLike extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'vehicle_id'];
}
