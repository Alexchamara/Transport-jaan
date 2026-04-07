<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorCourierLabelTemplate extends Model
{
    use HasFactory;

    protected $table = 'courier_vendor_label_templates';

    protected $fillable = [
        'vendor_user_id',
        'size_id',
        'name',
        'template_type',
        'category_scope',
        'orientation',
        'builder_schema',
        'html_template',
        'css_template',
        'background_path',
        'asset_manifest',
        'field_overrides',
        'is_active',
        'is_system',
        'created_by_user_id',
        'updated_by_user_id',
        'metadata',
    ];

    protected $casts = [
        'builder_schema' => 'array',
        'asset_manifest' => 'array',
        'field_overrides' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
        'is_system' => 'boolean',
    ];

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by_user_id');
    }

    public function size()
    {
        return $this->belongsTo(VendorCourierLabelSize::class, 'size_id');
    }

    public function labels()
    {
        return $this->hasMany(VendorCourierLabel::class, 'template_id');
    }
}
