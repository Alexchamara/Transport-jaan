<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorCourierLabel extends Model
{
    use HasFactory;

    protected $table = 'courier_vendor_labels';

    protected $fillable = [
        'vendor_user_id',
        'shipment_id',
        'package_id',
        'template_id',
        'size_id',
        'category',
        'output_format',
        'status',
        'file_disk',
        'file_path',
        'file_name',
        'checksum',
        'page_count',
        'generated_at',
        'printed_at',
        'created_by_user_id',
        'metadata',
    ];

    protected $casts = [
        'page_count' => 'integer',
        'generated_at' => 'datetime',
        'printed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function shipment()
    {
        return $this->belongsTo(CourierShipment::class, 'shipment_id');
    }

    public function package()
    {
        return $this->belongsTo(CourierPackage::class, 'package_id');
    }

    public function template()
    {
        return $this->belongsTo(VendorCourierLabelTemplate::class, 'template_id');
    }

    public function size()
    {
        return $this->belongsTo(VendorCourierLabelSize::class, 'size_id');
    }
}
