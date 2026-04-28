<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierLabelPrintItem extends Model
{
    use HasFactory;

    protected $table = 'courier_label_print_items';

    protected $fillable = [
        'print_job_id',
        'vendor_user_id',
        'shipment_id',
        'package_id',
        'item_index',
        'page_number',
        'status',
        'validation_state',
        'error_code',
        'error_message',
        'compliance_errors',
        'render_warnings',
        'payload_snapshot',
        'generated_at',
        'printed_at',
    ];

    protected $casts = [
        'item_index' => 'integer',
        'page_number' => 'integer',
        'compliance_errors' => 'array',
        'render_warnings' => 'array',
        'payload_snapshot' => 'array',
        'generated_at' => 'datetime',
        'printed_at' => 'datetime',
    ];

    public function printJob()
    {
        return $this->belongsTo(CourierLabelPrintJob::class, 'print_job_id');
    }

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    public function shipment()
    {
        return $this->belongsTo(CourierShipment::class, 'shipment_id');
    }

    public function package()
    {
        return $this->belongsTo(CourierPackage::class, 'package_id');
    }
}
