<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierLabelExternalSyncLog extends Model
{
    use HasFactory;

    protected $table = 'courier_label_external_sync_logs';

    protected $fillable = [
        'vendor_user_id',
        'print_job_id',
        'print_item_id',
        'label_type',
        'provider',
        'status',
        'external_reference',
        'request_hash',
        'response_hash',
        'meta',
        'synced_at',
    ];

    protected $casts = [
        'meta' => 'array',
        'synced_at' => 'datetime',
    ];

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    public function printJob()
    {
        return $this->belongsTo(CourierLabelPrintJob::class, 'print_job_id');
    }

    public function printItem()
    {
        return $this->belongsTo(CourierLabelPrintItem::class, 'print_item_id');
    }
}
