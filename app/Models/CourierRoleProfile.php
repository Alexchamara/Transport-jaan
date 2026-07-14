<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierRoleProfile extends Model
{
    use HasFactory;

    protected $table = 'team_user_courier_role_profiles';

    protected $fillable = [
        'service_workspace_id',
        'role_name',
        'role_label',
        'source_type',
        'source_template',
        'cloned_from_role',
        'description',
        'latest_version',
        'is_system',
        'is_active',
        'created_by_user_id',
        'updated_by_user_id',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function workspace()
    {
        return $this->belongsTo(ServiceWorkspace::class, 'service_workspace_id');
    }

    public function versions()
    {
        return $this->hasMany(CourierRoleProfileVersion::class, 'courier_role_profile_id');
    }
}
