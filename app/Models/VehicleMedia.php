<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VehicleMedia extends Model
{
    protected $table = 'vehicle_media';

    protected $fillable = [
        'vehicle_id',
        'media_type', // image|video
        'title',
        'path',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Expose a browser-usable URL in JSON responses
    protected $appends = ['url', 'full_url'];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function getUrlAttribute(): ?string
    {
        return $this->getFullUrlAttribute();
    }

    public function getFullUrlAttribute(): ?string
    {
        $path = $this->path;
        if (!$path) {
            return asset('images/default-vehicle.jpg');
        }

        // Already absolute URL?
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        // Already starts with http/https?
        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        // If path starts with asset prefix, extract the path part
        if (Str::startsWith($path, 'asset(')) {
            // This shouldn't happen, but handle it just in case
            return $path;
        }

        // Root-relative path starting with /?
        if (Str::startsWith($path, '/')) {
            return asset(ltrim($path, '/'));
        }

        // Normalize common saved prefixes
        $cleanPath = ltrim($path, '/');
        if (Str::startsWith($cleanPath, 'public/')) {
            $cleanPath = substr($cleanPath, 7);
        }
        if (Str::startsWith($cleanPath, 'storage/')) {
            $cleanPath = substr($cleanPath, 8);
        }

        // Check if file exists in public storage
        if (Storage::disk('public')->exists($cleanPath)) {
            return Storage::disk('public')->url($cleanPath);
        }

        // Check if file exists in public directory
        if (file_exists(public_path($cleanPath))) {
            return asset($cleanPath);
        }

        // If none of the above worked, try to serve the path as-is through storage
        // This handles paths like "vehicles/1/images/filename.jpg"
        if (Storage::disk('public')->exists('storage/' . $cleanPath) || Storage::disk('public')->exists($cleanPath)) {
            return Storage::disk('public')->url($cleanPath);
        }

        // Return default image if file doesn't exist
        return asset('images/default-vehicle.jpg');
    }

    /**
     * Scope to get primary image
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary', 1)->orderBy('sort_order');
    }

    /**
     * Scope to get images only
     */
    public function scopeImages($query)
    {
        return $query->where('media_type', 'image')->orderBy('sort_order');
    }
}
