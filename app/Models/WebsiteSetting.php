<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebsiteSetting extends Model
{
    protected $fillable = [
        'site_name',
        'logo',
        'description',
        'contact_email',
        'contact_phone',
        'address',
        'city',
        'country',
        'social_media',
    ];

    protected $casts = [
        'social_media' => 'json',
    ];
}

