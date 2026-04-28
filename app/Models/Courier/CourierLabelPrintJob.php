<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierLabelPrintJob extends Model
{
    use HasFactory;

    protected $table = 'courier_label_print_jobs';

    protected $fillable = [
        'vendor_user_id',
        'template_id',
        'size_id',
        'status',
        'mode',
        'output_format',
        'total_items',
        'generated_items',
        'failed_items',
        'file_disk',
        'file_path',
        'file_name',
        'checksum',
        'generated_at',
        'printed_at',
        'requested_by_user_id',
        'metadata',
    ];

    protected $casts = [
        'total_items' => 'integer',
        'generated_items' => 'integer',
        'failed_items' => 'integer',
        'generated_at' => 'datetime',
        'printed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    public function template()
    {
        return $this->belongsTo(CourierLabelTemplate::class, 'template_id');
    }

    public function size()
    {
        return $this->belongsTo(CourierLabelSize::class, 'size_id');
    }

    public function items()
    {
        return $this->hasMany(CourierLabelPrintItem::class, 'print_job_id');
    }
}
