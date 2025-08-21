<?php

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
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'provider_id',
        'type',
        'category_id',
        'model',
        'manufacturer',
        'manufacture_year',
        'registration_year',
        'registration_number',
        'colour',
        'condition',
        'ownership_type',
        'passenger_capacity',
        'mileage_km',
        'rental_price_per_day',
        'total_rental_price',
        'deposit_amount',
        'advance_payment_amount',
        'currency',
        'insurance_provider',
        'insurance_policy_number',
        'gps',
        'child_seat',
        'wifi',
        'insurance_coverage',
        'extra',
        'contact_name',
        'contact_email',
        'contact_phone',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'latitude',
        'longitude',
        'status',
        'approval_status',
        'approved_by',
        'approved_at',
        'description',
        'images_json',
        'insurance_docs_json',
    ];

    protected $casts = [
        'gps' => 'bool',
        'child_seat' => 'bool',
        'wifi' => 'bool',
        'insurance_coverage' => 'bool',
        'rental_price_per_day' => 'decimal:2',
        'total_rental_price' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'advance_payment_amount' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'approved_at' => 'datetime',
        'images_json' => 'array',
        'insurance_docs_json' => 'array',
    ];

    /** Provider/owner (User) */
    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    /** Approver (admin User) */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /** Category */
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

    /** Media */
    public function media()
    {
        return $this->hasMany(VehicleMedia::class);
    }

    public function images()
    {
        return $this->media()->where('media_type', 'image');
    }

    public function videos()
    {
        return $this->media()->where('media_type', 'video');
    }

    public function primaryImage()
    {
        return $this->hasOne(VehicleMedia::class)->where('is_primary', true);
    }

    /** Documents */
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

}
