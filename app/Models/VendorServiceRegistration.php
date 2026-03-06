<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorServiceRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'service_category_id',
        'service_sub_category_id',
        'field_values',
        'pre_revision_field_values',
        'status',
        'admin_notes',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'resubmission_count',
        'last_resubmitted_at',
    ];

    protected $casts = [
        'field_values' => 'array',
        'pre_revision_field_values' => 'array',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'last_resubmitted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function serviceCategory()
    {
        return $this->belongsTo(ServiceCategory::class);
    }

    public function serviceSubCategory()
    {
        return $this->belongsTo(ServiceSubCategory::class);
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isSubmitted(): bool
    {
        return $this->status === 'submitted';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function isRevisionRequested(): bool
    {
        return $this->status === 'revision_requested';
    }

    public function canEdit(): bool
    {
        // Allow editing if draft, revision_requested, or rejected
        return in_array($this->status, ['draft', 'revision_requested', 'rejected']);
    }

    public function canResubmit(): bool
    {
        // Can resubmit if rejected or revision_requested
        return in_array($this->status, ['rejected', 'revision_requested']);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
