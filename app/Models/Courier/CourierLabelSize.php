<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierLabelSize extends Model
{
    use HasFactory;

    protected $table = 'courier_label_sizes';

    protected $fillable = [
        'vendor_user_id',
        'name',
        'width_mm',
        'height_mm',
        'is_active',
        'is_system',
        'created_by_user_id',
        'updated_by_user_id',
        'metadata',
    ];

    protected $casts = [
        'width_mm' => 'decimal:2',
        'height_mm' => 'decimal:2',
        'is_active' => 'boolean',
        'is_system' => 'boolean',
        'metadata' => 'array',
    ];

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    public function templates()
    {
        return $this->hasMany(CourierLabelTemplate::class, 'size_id');
    }
}
