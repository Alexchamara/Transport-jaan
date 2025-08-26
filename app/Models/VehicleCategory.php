<?php
// app/Models/VehicleCategory.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleCategory extends Model
{
    protected $fillable = [
        'type', // land|air|sea
        'name',
    ];
}
