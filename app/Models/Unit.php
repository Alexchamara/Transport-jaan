<?php

// app/Models/Unit.php
namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    protected $fillable = [
        'brand','model','price_per_day','status','units_count',
        'mileage','transmission','capacity','fuel_type','image_path'
    ];

    public function scopeFilter(Builder $q, array $filters): Builder
    {
        $q->when($filters['search'] ?? null, function ($q, $term) {
            $q->where(function($qq) use ($term) {
                $qq->where('brand','like',"%{$term}%")
                   ->orWhere('model','like',"%{$term}%");
            });
        });

        $q->when($filters['status'] ?? null, fn($q,$v) => $q->where('status',$v));
        $q->when($filters['car_type'] ?? null, function ($q, $v) {
            // if you later store a type column, use it here.
            // For now we’ll map some “virtual” types via fuel/transmission if needed.
        });

        return $q;
    }
}
