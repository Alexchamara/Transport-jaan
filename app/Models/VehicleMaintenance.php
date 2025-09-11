<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VehicleMaintenance extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'vehicle_id',
        'start_date',
        'end_date',
        'reason',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
