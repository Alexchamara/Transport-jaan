<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

class VehiclePolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'file_path',
        'original_name',
        'mime_type',
        'size',
        'disk',
    ];

    public function vehicle()
    {
        return $this->belongsTo(\App\Models\Vehicle::class);
    }

    public function getUrlAttribute(): ?string
    {
        return $this->file_path
            ? Storage::disk($this->disk ?: 'public')->url($this->file_path)
            : null;
    }
}
