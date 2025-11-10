<?php

namespace App\Models\Courier;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierAddress extends Model
{
    use HasFactory;

    protected $fillable = [
        'contact_id',
        'label',
        'line1',
        'line2',
        'city',
        'state',
        'postal_code',
        'country',
        'latitude',
        'longitude',
        'instructions',
        'is_primary',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'is_primary' => 'boolean',
    ];

    public function contact()
    {
        return $this->belongsTo(CourierContact::class, 'contact_id');
    }

    public function senderShipments()
    {
        return $this->hasMany(CourierShipment::class, 'sender_address_id');
    }

    public function recipientShipments()
    {
        return $this->hasMany(CourierShipment::class, 'recipient_address_id');
    }
}
