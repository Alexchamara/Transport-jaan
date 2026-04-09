<?php

namespace App\Models\Location;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LocationCountry extends Model
{
    use HasFactory;

    protected $fillable = [
        'iso2',
        'iso3',
        'name_en',
        'name_native',
        'currency_code',
        'phone_code',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function provinces()
    {
        return $this->hasMany(LocationProvince::class, 'country_id');
    }
}
