<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceWorkspace extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_user_id',
        'service_key',
        'name',
        'owner_user_id',
        'status',
    ];

    public function vendorUser()
    {
        return $this->belongsTo(User::class, 'vendor_user_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
