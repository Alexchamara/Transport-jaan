<?php

namespace App\Models\Warehouse;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class WarehouseImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'warehouse_unit_id',
        'file_path',
        'original_name',
        'alt_text',
        'caption',
        'type',
        'sort_order',
        'mime_type',
        'file_size',
        'dimensions',
        'disk',
        'is_active',
    ];

    protected $casts = [
        'dimensions' => 'array',
        'is_active' => 'boolean',
        'file_size' => 'integer',
        'sort_order' => 'integer',
    ];

    // Relationships
    public function warehouseUnit()
    {
        return $this->belongsTo(WarehouseUnit::class);
    }

    // Accessors
    public function getUrlAttribute()
    {
        if (!$this->file_path) {
            return null;
        }
        
        try {
            // For public disk, generate URL directly
            if ($this->disk === 'public' || empty($this->disk)) {
                return Storage::url($this->file_path);
            }
            
            // Fallback to asset path
            return asset('storage/' . $this->file_path);
        } catch (\Exception $e) {
            // If URL generation fails, try asset path as fallback
            return asset('storage/' . $this->file_path);
        }
    }

    public function getFormattedSizeAttribute()
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('created_at');
    }

    public function scopeMain($query)
    {
        return $query->where('type', 'main');
    }

    public function scopeGallery($query)
    {
        return $query->where('type', 'gallery');
    }
}