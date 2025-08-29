<?php
// app/Models/Vehicle.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

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

        // 🔹 add this to store the uploaded policy PDF path on disk
        'policy_pdf_path',
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

    // 🔹 expose a URL in JSON
    protected $appends = ['policy_pdf_url'];

    public function getPolicyPdfUrlAttribute(): ?string
    {
        if (!$this->policy_pdf_path) {
            return null;
        }
        // Return a /storage/... URL only if the file exists
        return Storage::disk('public')->exists($this->policy_pdf_path)
            ? Storage::disk('public')->url($this->policy_pdf_path)
            : null;
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

    public function crew()
    {
        return $this->hasMany(VehicleCrew::class);
    }
}
