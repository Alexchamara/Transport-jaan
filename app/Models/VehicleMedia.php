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
    protected $appends = ['url'];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function getUrlAttribute(): ?string
    {
        $path = $this->path;
        if (!$path) return null;

        // Already absolute or root-relative?
        if (Str::startsWith($path, ['http://', 'https://', '/'])) {
            return $path;
        }

        // Normalize common saved prefixes
        $path = ltrim($path, '/');
        if (Str::startsWith($path, 'public/'))  $path = substr($path, 7);
        if (Str::startsWith($path, 'storage/')) $path = substr($path, 8);

        // Force public disk so we always emit /storage/...
        return Storage::disk('public')->url($path);
    }
}
