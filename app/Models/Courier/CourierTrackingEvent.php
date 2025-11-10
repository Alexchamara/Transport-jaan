<?php

namespace App\Models\Courier;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierTrackingEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'shipment_id',
        'status',
        'location',
        'recorded_at',
        'description',
        'meta',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
        'meta' => 'array',
    ];

    public function shipment()
    {
        return $this->belongsTo(CourierShipment::class, 'shipment_id');
    }
}
