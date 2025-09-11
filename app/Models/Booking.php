<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class Booking extends Model
{
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
    public function schedule() { return $this->hasOne(BookingSchedule::class); }
    public function addons()   { return $this->hasMany(BookingAddon::class); }
    public function payments() { return $this->hasMany(BookingPayment::class); }
    public function customer() { return $this->hasOne(BookingCustomer::class); }

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
}
