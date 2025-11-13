<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VehicleCategory extends Model
{
    use HasFactory;

    protected $fillable = ['type','name'];

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'category_id');
    }
}
