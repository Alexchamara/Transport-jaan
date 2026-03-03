<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'business_registration_no',
        'tax_id',
        'business_type',
        'description',
        'logo',
        'website',
        'established_year',
        'employee_count',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'postal_code',
        'country',
        'contact_person',
        'contact_phone',
        'contact_email',
        'submission_status',
        'admin_notes',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isDraft(): bool
    {
        return $this->submission_status === 'draft';
    }

    public function isSubmitted(): bool
    {
        return $this->submission_status === 'submitted';
    }

    public function isApproved(): bool
    {
        return $this->submission_status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->submission_status === 'rejected';
    }

    public function isRevisionRequested(): bool
    {
        return $this->submission_status === 'revision_requested';
    }

    public function canEdit(): bool
    {
        return in_array($this->submission_status, ['draft', 'revision_requested']);
    }
}
