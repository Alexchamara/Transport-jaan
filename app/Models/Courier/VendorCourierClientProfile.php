<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorCourierClientProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_user_id',
        'contact_id',
        'watchlist',
        'priority_tag',
        'client_tier',
        'account_owner',
        'internal_notes',
    ];

    protected $casts = [
        'watchlist' => 'boolean',
    ];

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    public function contact()
    {
        return $this->belongsTo(CourierContact::class, 'contact_id');
    }
}
