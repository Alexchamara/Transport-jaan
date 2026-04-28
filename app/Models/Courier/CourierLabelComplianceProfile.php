<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierLabelComplianceProfile extends Model
{
    use HasFactory;

    protected $table = 'courier_label_compliance_profiles';

    protected $fillable = [
        'vendor_user_id',
        'country_code',
        'exporter_id',
        'default_incoterm',
        'profile',
    ];

    protected $casts = [
        'profile' => 'array',
    ];

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }
}
