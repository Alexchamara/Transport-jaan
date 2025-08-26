<?php
// app/Models/Vehicle.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'provider_id',
        'type',                 // land|air|sea
        'category_id',

        'model',
        'manufacturer',
        'manufacture_year',
        'registration_year',
        'registration_number',
        'colour',

        'condition',            // new|used|refurbished...
        'ownership_type',       // company_owned|leased|partner_owned

        'passenger_capacity',
        'mileage_km',

        'rental_price_per_day',
        'total_rental_price',
        'deposit_amount',
        'advance_payment_amount',

        'insurance_provider',

        'gps',
        'child_seat',
        'wifi',
        'insurance_coverage',

        'extra',
        'status',               // inactive|active|available...
        'approval_status',      // pending|approved|rejected
        'description',
    ];

    protected $casts = [
        'gps'                => 'boolean',
        'child_seat'         => 'boolean',
        'wifi'               => 'boolean',
        'insurance_coverage' => 'boolean',
        'passenger_capacity' => 'integer',
        'mileage_km'         => 'integer',
        'rental_price_per_day'   => 'decimal:2',
        'total_rental_price'     => 'decimal:2',
        'deposit_amount'         => 'decimal:2',
        'advance_payment_amount' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(VehicleCategory::class, 'category_id');
    }

    public function airSpec()
    {
        return $this->hasOne(AirVehicleSpec::class);
    }

    public function seaSpec()
    {
        return $this->hasOne(SeaVehicleSpec::class);
    }

    public function landSpec()
    {
        return $this->hasOne(LandVehicleSpec::class);
    }

    public function media()
    {
        return $this->hasMany(VehicleMedia::class);
    }

    public function documents()
    {
        return $this->hasMany(VehicleDocument::class);
    }

    public function crew()
    {
        return $this->hasMany(VehicleCrew::class);
    }
}
