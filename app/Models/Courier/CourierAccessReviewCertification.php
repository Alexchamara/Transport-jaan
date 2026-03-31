<?php

namespace App\Models\Courier;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierAccessReviewCertification extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_user_id',
        'service_workspace_id',
        'subject_user_id',
        'reviewer_user_id',
        'cycle_type',
        'cycle_key',
        'status',
        'due_at',
        'certified_at',
        'last_access_at',
        'alerted_dormant_at',
        'notes',
        'snapshot',
    ];

    protected $casts = [
        'due_at' => 'datetime',
        'certified_at' => 'datetime',
        'last_access_at' => 'datetime',
        'alerted_dormant_at' => 'datetime',
        'snapshot' => 'array',
    ];

    public function subjectUser()
    {
        return $this->belongsTo(User::class, 'subject_user_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_user_id');
    }
}
