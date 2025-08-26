<?php
// app/Models/VehicleMedia.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleMedia extends Model
{
    protected $fillable = [
        'vehicle_id',
        'media_type', // image|video
        'title',
        'path',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
