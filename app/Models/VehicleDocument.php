<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleDocument extends Model
{
    protected $fillable = [
        'vehicle_id',
        'doc_type',
        'provider_name',
        'policy_or_doc_number',
        'issue_date',
        'expiry_date',
        'file_path',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date'=> 'date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
