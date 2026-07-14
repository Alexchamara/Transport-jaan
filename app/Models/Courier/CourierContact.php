<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierContact extends Model
{
    use HasFactory;

    public const ROLE_SENDER = 'sender';
    public const ROLE_RECIPIENT = 'recipient';

    protected $fillable = [
        'user_id',
        'role',
        'name',
        'email',
        'phone',
        'company_name',
        'preferred_contact_method',
        'is_favorite',
    ];

    protected $casts = [
        'is_favorite' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function addresses()
    {
        return $this->hasMany(CourierAddress::class, 'contact_id');
    }

    public function sentShipments()
    {
        return $this->hasMany(CourierShipment::class, 'sender_contact_id');
    }

    public function receivedShipments()
    {
        return $this->hasMany(CourierShipment::class, 'recipient_contact_id');
    }
}
