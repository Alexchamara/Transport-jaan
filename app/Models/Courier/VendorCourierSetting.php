<?php

namespace App\Models\Courier;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorCourierSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_user_id',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
    ];
}
