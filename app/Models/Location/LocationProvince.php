<?php

namespace App\Models\Location;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LocationProvince extends Model
{
    use HasFactory;

    protected $fillable = [
        'country_id',
        'external_ref',
        'name_en',
        'name_si',
        'name_ta',
    ];

    public function country()
    {
        return $this->belongsTo(LocationCountry::class, 'country_id');
    }

    public function districts()
    {
        return $this->hasMany(LocationDistrict::class, 'province_id');
    }
}
