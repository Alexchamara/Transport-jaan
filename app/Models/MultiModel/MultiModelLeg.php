<?php

namespace App\Models\MultiModel;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Vehicle;

class MultiModelLeg extends Model
{
    use HasFactory;

    protected $fillable = [
        'multi_model_journey_id',
        'leg_order',
        'from_location',
        'to_location',
        'start_datetime',
        'end_datetime',
        'vehicle_type',
        'vehicle_id',
        'vehicle_snapshot',
        'status',
    ];

    protected $casts = [
        'vehicle_snapshot' => 'array',
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
    ];

    /**
     * Get the journey this leg belongs to
     */
    public function journey()
    {
        return $this->belongsTo(MultiModelJourney::class, 'multi_model_journey_id');
    }

    /**
     * Get the vehicle for this leg
     */
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Get the booking for this leg
     */
    public function bookings()
    {
        return $this->hasMany(MultiModelBooking::class);
    }

    /**
     * Get the primary booking for this leg
     */
    public function booking()
    {
        return $this->hasOne(MultiModelBooking::class)->latestOfMany();
    }

    /**
     * Get duration in days
     */
    public function getDurationDaysAttribute()
    {
        return max(1, $this->start_datetime->diffInDays($this->end_datetime));
    }

    /**
     * Get formatted route
     */
    public function getRouteAttribute()
    {
        return "{$this->from_location} → {$this->to_location}";
    }
}
