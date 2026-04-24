<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\AirVehicleBookingSchedule;
use App\Models\AirVehicleBookingPayment;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Laravel\Scout\Searchable;
class AirVehicleBookings extends Model
{
    use Searchable;

    public const VEHICLE_OWNER_KEY = 'provider_id';

    protected $fillable = [
        'client_id',
        'vehicle_id',
        'status',
        'price_per_day',
        'rental_days',
        'addons_total',
        'subtotal',
        'deposit_amount',
        'advance_amount',
        'total_amount',
        'currency',
        'addons_snapshot',
        'vehicle_snapshot',
        'notes',
    ];

    protected $casts = [
        'addons_snapshot'  => 'array',
        'vehicle_snapshot' => 'array',
        'price_per_day'    => 'float',
        'addons_total'     => 'float',
        'subtotal'         => 'float',
        'deposit_amount'   => 'float',
        'advance_amount'   => 'float',
        'total_amount'     => 'float',
        'rental_days'      => 'integer',
        'created_at'       => 'datetime',
        'updated_at'       => 'datetime',
    ];

    protected $with    = ['schedule'];
    protected $appends = ['start_date', 'end_date'];

    public function client()   { return $this->belongsTo(User::class, 'client_id'); }
    public function vehicle()  { return $this->belongsTo(Vehicle::class); }
    // Explicit foreign key because this model class name is plural. Laravel would otherwise
    // assume `air_vehicle_bookings_id` which doesn't exist (migration uses `air_vehicle_booking_id`).
    public function schedule() { return $this->hasOne(AirVehicleBookingSchedule::class, 'air_vehicle_booking_id'); }
    // Use the dedicated AirVehicleBookingAddon model and explicit FK name.
    // Without an explicit FK Laravel would guess `air_vehicle_bookings_id` (incorrect),
    // so set the related model and the correct foreign key `air_vehicle_booking_id`.
    public function addons()   { return $this->hasMany(AirVehicleBookingAddon::class, 'air_vehicle_booking_id'); }
    public function payments() { return $this->hasMany(AirVehicleBookingPayment::class, 'air_vehicle_booking_id'); }
    public function customer() { return $this->hasOne(BookingCustomer::class, 'air_vehicle_booking_id'); }

    public function getStartDateAttribute(): ?Carbon
    {
        $d = $this->schedule?->pickup_at; // ✅ null-safe
        return $d ? Carbon::parse($d) : null;
    }

    public function getEndDateAttribute(): ?Carbon
    {
        $d = $this->schedule?->dropoff_at; // ✅ null-safe
        return $d ? Carbon::parse($d) : null;
    }

    /**
     * Get the number of days until pickup date
     */
    public function getDaysUntilPickup(): ?float
    {
        $pickupDate = $this->schedule?->pickup_at;
        if (!$pickupDate) {
            return null;
        }
        
        return Carbon::now()->diffInDays(Carbon::parse($pickupDate), false);
    }

    public function scopeForVendor(Builder $q, int $vendorId, string $ownerKey = self::VEHICLE_OWNER_KEY): Builder
    {
        return $q->whereHas('vehicle', fn($v) => $v->where($ownerKey, $vendorId));
    }

    public function scopeBetweenSchedule(Builder $q, $start, $end): Builder
    {
        if (!$start || !$end) return $q;
        $start = Carbon::parse($start);
        $end   = Carbon::parse($end);

        return $q->whereHas('schedule', function ($s) use ($start, $end) {
            $s->whereBetween('pickup_at',  [$start, $end])
              ->orWhereBetween('dropoff_at', [$start, $end])
              ->orWhere(function ($ov) use ($start, $end) {
                  $ov->where('pickup_at', '<=', $start)->where('dropoff_at', '>=', $end);
              });
        });
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => (int) $this->id,
            'client_id' => (int) ($this->client_id ?? 0),
            'vehicle_id' => (int) ($this->vehicle_id ?? 0),
            'status' => (string) ($this->status ?? ''),
            'currency' => (string) ($this->currency ?? ''),
            'total_amount' => (string) ($this->total_amount ?? ''),
            'notes' => (string) ($this->notes ?? ''),
            'vehicle_snapshot' => json_encode($this->vehicle_snapshot ?? []),
            'addons_snapshot' => json_encode($this->addons_snapshot ?? []),
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
