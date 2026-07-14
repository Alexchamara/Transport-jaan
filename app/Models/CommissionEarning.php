<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CommissionEarning extends Model
{
    use HasFactory;

    protected $table = 'commission_earnings';

    protected $fillable = [
        'booking_type',
        'booking_id',
        'payment_id',
        'payment_table',
        'service_type',
        'booking_amount',
        'commission_percentage',
        'total_commission',
        'admin_amount',
        'vendor_amount',
        'admin_percentage',
        'vendor_percentage',
        'vendor_id',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'booking_amount' => 'decimal:2',
        'commission_percentage' => 'decimal:2',
        'total_commission' => 'decimal:2',
        'admin_amount' => 'decimal:2',
        'vendor_amount' => 'decimal:2',
        'admin_percentage' => 'decimal:2',
        'vendor_percentage' => 'decimal:2',
        'paid_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function vendor()
    {
        return $this->belongsTo(\App\Models\User::class, 'vendor_id');
    }

    public function commission()
    {
        return $this->belongsTo(Commission::class, 'service_type', 'service_type');
    }

    // Scopes
    public function scopeByServiceType($query, $serviceType)
    {
        return $query->where('service_type', $serviceType);
    }

    public function scopeByVendor($query, $vendorId)
    {
        return $query->where('vendor_id', $vendorId);
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    // Helper methods
    public static function calculateCommission($bookingAmount, $commissionPercentage, $adminPercentage = 50, $vendorPercentage = 50)
    {
        $totalCommission = ($bookingAmount * $commissionPercentage) / 100;
        $adminAmount = ($totalCommission * $adminPercentage) / 100;
        $vendorAmount = ($totalCommission * $vendorPercentage) / 100;

        return [
            'total_commission' => round($totalCommission, 2),
            'admin_amount' => round($adminAmount, 2),
            'vendor_amount' => round($vendorAmount, 2),
        ];
    }

    // Get summary data for dashboard
    public static function getAdminSummary($startDate = null, $endDate = null)
    {
        $query = self::where('status', 'paid');

        if ($startDate) {
            $query->whereDate('paid_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('paid_at', '<=', $endDate);
        }

        return [
            'total_earned' => $query->sum('admin_amount'),
            'count' => $query->count(),
            'by_service' => $query->groupBy('service_type')
                ->selectRaw('service_type, SUM(admin_amount) as total, COUNT(*) as count')
                ->get(),
        ];
    }

    public static function getVendorSummary($vendorId, $startDate = null, $endDate = null)
    {
        $query = self::where('vendor_id', $vendorId)
            ->where('status', 'paid');

        if ($startDate) {
            $query->whereDate('paid_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('paid_at', '<=', $endDate);
        }

        return [
            'total_earned' => $query->sum('vendor_amount'),
            'count' => $query->count(),
            'by_service' => $query->groupBy('service_type')
                ->selectRaw('service_type, SUM(vendor_amount) as total, COUNT(*) as count')
                ->get(),
        ];
    }
}
