<?php
// app/Models/Vehicle.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\VehicleCategory;
use App\Models\LandVehicleSpec;
use App\Models\AirVehicleSpec;
use App\Models\SeaVehicleSpec;
use App\Models\VehicleMedia;
use App\Models\VehicleDocument;
use App\Models\VehicleCrew;
use App\Models\User;
use App\Models\VehicleReview;


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

    /** Specs (one per vehicle depending on type) */
    public function landSpec()
    {
        return $this->hasOne(LandVehicleSpec::class);
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

    public function insuranceDocuments()
    {
        return $this->documents()->where('doc_type', 'insurance');
    }

    /** Crews */
    public function crewLinks()
    {
        return $this->hasMany(VehicleCrew::class);
    }

    public function crewMembers()
    {
        return $this->belongsToMany(User::class, 'vehicle_crews')
            ->withPivot(['id', 'role', 'license_number', 'license_type', 'license_expiry', 'rating'])
            ->withTimestamps();
    }

    public function drivers()
    {
        return $this->crewMembers()->wherePivot('role', 'driver');
    }

    public function pilots()
    {
        return $this->crewMembers()->wherePivot('role', 'pilot');
    }

    public function captains()
    {
        return $this->crewMembers()->wherePivot('role', 'captain');
    }

    /** Scopes */
    public function scopeType($q, string $type)
    {
        return $q->where('type', $type);
    }

    public function scopeActive($q)
    {
        return $q->where('status', 'active')->where('approval_status', 'approved');
    }

 public function reviews()
{
  
    return $this->hasMany(VehicleReview::class, 'vehicle_id', 'id');
}

    public function crew()
    {
        return $this->hasMany(VehicleCrew::class);
    }
}
