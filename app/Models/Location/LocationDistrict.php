<?php

namespace App\Models\Location;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LocationDistrict extends Model
{
    use HasFactory;

    protected $fillable = [
        'province_id',
        'external_ref',
        'name_en',
        'name_si',
        'name_ta',
    ];

    public function province()
    {
        return $this->belongsTo(LocationProvince::class, 'province_id');
    }

    public function cities()
    {
        return $this->hasMany(LocationCity::class, 'district_id');
    }
}
