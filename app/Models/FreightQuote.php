<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FreightQuote extends Model
{
    use HasFactory;

    protected $fillable = [
        'origin',
        'destination',
        'load_type',
        'goods_description',
        'length_cm',
        'width_cm',
        'height_cm',
        'total_weight_kg',
        'preferred_method',
        'shipping_date',
        'notes',
        'status',
    ];
}
