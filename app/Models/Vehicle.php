<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Vehicle extends Model
{
    use HasFactory, SoftDeletes;

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
        'condition',            // new|used|refurbished
        'ownership_type',       // company_owned|partner_owned|leased
        'passenger_capacity',
        'mileage_km',
        'rental_price_per_day',
        'total_rental_price',
        'deposit_amount',
        'advance_payment_amount',
        'currency',
        'insurance_provider',
        'gps',
        'child_seat',
        'wifi',
        'insurance_coverage',
        'extra',
        'status',               // draft|active|inactive
        'approval_status',      // pending|approved|rejected
        'description',
        'images_json',
        'insurance_docs_json',
    ];

    protected $casts = [
        'gps' => 'boolean',
        'child_seat' => 'boolean',
        'wifi' => 'boolean',
        'insurance_coverage' => 'boolean',
        'passenger_capacity' => 'integer',
        'mileage_km' => 'integer',
        'rental_price_per_day' => 'decimal:2',
        'total_rental_price' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'advance_payment_amount' => 'decimal:2',
        'manufacture_year' => 'integer',
        'registration_year' => 'integer',
        'images_json' => 'array',
        'insurance_docs_json' => 'array',
    ];

    /* -------- Relations -------- */

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

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

    public function insuranceDocuments()
    {
        return $this->documents()->where('doc_type', 'insurance');
    }

    public function crew()
    {
        return $this->hasMany(VehicleCrew::class);
    } // keep only this
    public function crewMembers()
    {
        return $this->belongsToMany(User::class, 'vehicle_crews')
            ->withPivot(['id', 'role', 'license_number', 'license_type', 'license_expiry', 'rating', 'is_primary'])
            ->withTimestamps();
    }

    public function reviews()
    {
        return $this->hasMany(VehicleReview::class, 'vehicle_id');
    }
    public function likes()
    {
        return $this->hasMany(VehicleLike::class);
    }
    public function featurePricings()
    {
        return $this->hasMany(VehicleFeaturePricing::class);
    }

    /* -------- Scopes -------- */

    public function scopeType($q, string $type)
    {
        return $q->where('type', $type);
    }

    // Active & approved in one go (matches your intent)
    public function scopeActive($q)
    {
        return $q->where('status', 'active')->where('approval_status', 'approved');
    }

    /* -------- Convenience Accessors (optional) -------- */

    public function getPrimaryImageUrlAttribute(): ?string
    {
        $primary = $this->media()->where('media_type', 'image')->where('is_primary', true)->first();
        return $primary?->path;
    }

    public function getAverageRatingAttribute(): float
    {
        return (float) ($this->reviews()->avg('rating') ?? 0);
    }

    public function getReviewCountAttribute(): int
    {
        return (int) $this->reviews()->count();
    }

    public function images()
    {
        // Only image-type media
        return $this->hasMany(VehicleMedia::class)->where('media_type', 'image');
    }

    public function primaryImage()
    {
        // The one primary image (fast & safe)
        return $this->hasOne(VehicleMedia::class)
            ->where('media_type', 'image')
            ->where('is_primary', true)
            ->ofMany('id', 'max'); // requires MySQL 8+/Postgres
    }
}
