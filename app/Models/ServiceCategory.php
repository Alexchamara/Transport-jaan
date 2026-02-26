<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function subCategories()
    {
        return $this->hasMany(ServiceSubCategory::class)->orderBy('display_order');
    }

    public function activeSubCategories()
    {
        return $this->hasMany(ServiceSubCategory::class)->where('is_active', true)->orderBy('display_order');
    }

    public function vendorRegistrations()
    {
        return $this->hasMany(VendorServiceRegistration::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }
}
