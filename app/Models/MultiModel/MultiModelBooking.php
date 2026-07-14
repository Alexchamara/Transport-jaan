<?php

namespace App\Models\MultiModel;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Vehicle;

class MultiModelBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'multi_model_leg_id',
        'multi_model_journey_id',
        'user_id',
        'vehicle_id',
        'status',
        'rental_days',
        'price_per_day',
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
        'addons_snapshot' => 'array',
        'vehicle_snapshot' => 'array',
        'price_per_day' => 'decimal:2',
        'addons_total' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'advance_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the leg this booking belongs to
     */
    public function leg()
    {
        return $this->belongsTo(MultiModelLeg::class, 'multi_model_leg_id');
    }

    /**
     * Get the journey this booking belongs to
     */
    public function journey()
    {
        return $this->belongsTo(MultiModelJourney::class, 'multi_model_journey_id');
    }

    /**
     * Get the user who made this booking
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the vehicle for this booking
     */
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by vehicle type
     */
    public function scopeByVehicleType($query, $type)
    {
        return $query->whereHas('vehicle', function ($q) use ($type) {
            $q->where('type', $type);
        });
    }
}
