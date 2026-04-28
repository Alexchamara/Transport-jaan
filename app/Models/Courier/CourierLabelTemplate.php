<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierLabelTemplate extends Model
{
    use HasFactory;

    protected $table = 'courier_label_templates';

    protected $fillable = [
        'vendor_user_id',
        'size_id',
        'name',
        'category_scope',
        'layout_preset',
        'orientation',
        'version',
        'schema',
        'is_active',
        'is_system',
        'created_by_user_id',
        'updated_by_user_id',
        'metadata',
    ];

    protected $casts = [
        'version' => 'integer',
        'schema' => 'array',
        'is_active' => 'boolean',
        'is_system' => 'boolean',
        'metadata' => 'array',
    ];

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    public function size()
    {
        return $this->belongsTo(CourierLabelSize::class, 'size_id');
    }
}
