<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierRoleProfileVersion extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'team_user_courier_role_profile_versions';

    protected $fillable = [
        'courier_role_profile_id',
        'version',
        'change_type',
        'role_label',
        'description',
        'permissions',
        'metadata',
        'changed_by_user_id',
        'created_at',
    ];

    protected $casts = [
        'permissions' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function profile()
    {
        return $this->belongsTo(CourierRoleProfile::class, 'courier_role_profile_id');
    }
}
