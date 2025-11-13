<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleReview extends Model
{
    use HasFactory;

    protected $fillable = ['vehicle_id','client_id','rating','comment'];
    protected $casts = ['rating' => 'integer'];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    // Reviewer is a user with role=client
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}
