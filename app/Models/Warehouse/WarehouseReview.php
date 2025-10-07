<?php

namespace App\Models\Warehouse;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class WarehouseReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'warehouse_unit_id',
        'user_id',
        'rating',
        'comment',
        'pros',
        'cons',
        'stay_duration',
        'helpful_votes',
        'verified',
        'is_active'
    ];

    protected $casts = [
        'rating' => 'integer',
        'helpful_votes' => 'integer',
        'verified' => 'boolean',
        'is_active' => 'boolean'
    ];

    // Relationships
    public function warehouseUnit()
    {
        return $this->belongsTo(WarehouseUnit::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('verified', true);
    }

    public function scopeByRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }

    // Accessors
    public function getCustomerNameAttribute()
    {
        return $this->user ? $this->user->name : 'Anonymous User';
    }
}