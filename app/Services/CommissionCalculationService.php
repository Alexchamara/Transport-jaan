<?php

namespace App\Services;

use App\Models\CommissionEarning;
use App\Models\Commission;

class CommissionCalculationService
{
    /**
     * Process commission when a booking is paid
     *
     * @param string $bookingType ('land', 'air', 'sea', 'warehouse')
     * @param int $bookingId
     * @param string $serviceType ('vehicle', 'warehouse', 'courier', etc.)
     * @param decimal $bookingAmount
     * @param int|null $vendorId
     * @param int|null $paymentId
     * @param string|null $paymentTable
     * @return CommissionEarning|null
     */
    public static function createCommissionEarning(
        $bookingType,
        $bookingId,
        $serviceType,
        $bookingAmount,
        $vendorId = null,
        $paymentId = null,
        $paymentTable = null
    ) {
        // Get commission percentage for this service type
        $commissionConfig = Commission::where('service_type', $serviceType)
            ->where('is_active', true)
            ->first();

        if (!$commissionConfig) {
            // No commission configured for this service
            return null;
        }

        $commissionPercentage = $commissionConfig->commission_percentage;

        // Calculate commission amounts (default 50/50 split)
        $calculations = CommissionEarning::calculateCommission(
            $bookingAmount,
            $commissionPercentage,
            50, // admin gets 50%
            50  // vendor gets 50%
        );

        // Check if commission earning already exists for this booking
        $existing = CommissionEarning::where('booking_type', $bookingType)
            ->where('booking_id', $bookingId)
            ->first();

        if ($existing) {
            // Update existing record
            $existing->update([
                'booking_amount' => $bookingAmount,
                'commission_percentage' => $commissionPercentage,
                'total_commission' => $calculations['total_commission'],
                'admin_amount' => $calculations['admin_amount'],
                'vendor_amount' => $calculations['vendor_amount'],
                'status' => 'paid',
                'paid_at' => now(),
                'payment_id' => $paymentId,
                'payment_table' => $paymentTable,
            ]);

            return $existing;
        }

        // Create new commission earning record
        return CommissionEarning::create([
            'booking_type' => $bookingType,
            'booking_id' => $bookingId,
            'payment_id' => $paymentId,
            'payment_table' => $paymentTable,
            'service_type' => $serviceType,
            'booking_amount' => $bookingAmount,
            'commission_percentage' => $commissionPercentage,
            'total_commission' => $calculations['total_commission'],
            'admin_amount' => $calculations['admin_amount'],
            'vendor_amount' => $calculations['vendor_amount'],
            'admin_percentage' => 50,
            'vendor_percentage' => 50,
            'vendor_id' => $vendorId,
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }

    /**
     * Update commission status when payment status changes
     *
     * @param string $bookingType
     * @param int $bookingId
     * @param string $status ('pending', 'paid', 'failed')
     * @return CommissionEarning|null
     */
    public static function updateCommissionStatus($bookingType, $bookingId, $status)
    {
        $commission = CommissionEarning::where('booking_type', $bookingType)
            ->where('booking_id', $bookingId)
            ->first();

        if ($commission) {
            $commission->update([
                'status' => $status,
                'paid_at' => $status === 'paid' ? now() : null,
            ]);
        }

        return $commission;
    }

    /**
     * Get admin commission summary
     *
     * @param string|null $startDate
     * @param string|null $endDate
     * @return array
     */
    public static function getAdminSummary($startDate = null, $endDate = null)
    {
        return CommissionEarning::getAdminSummary($startDate, $endDate);
    }

    /**
     * Get vendor commission summary
     *
     * @param int $vendorId
     * @param string|null $startDate
     * @param string|null $endDate
     * @return array
     */
    public static function getVendorSummary($vendorId, $startDate = null, $endDate = null)
    {
        return CommissionEarning::getVendorSummary($vendorId, $startDate, $endDate);
    }

    /**
     * Get commission breakdown by service type
     *
     * @return array
     */
    public static function getCommissionBreakdown($startDate = null, $endDate = null)
    {
        $query = CommissionEarning::where('status', 'paid');

        if ($startDate) {
            $query->whereDate('paid_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('paid_at', '<=', $endDate);
        }

        return $query->groupBy('service_type')
            ->selectRaw('
                service_type,
                COUNT(*) as bookings_count,
                SUM(booking_amount) as total_booking_amount,
                SUM(total_commission) as total_commission,
                SUM(admin_amount) as admin_total,
                SUM(vendor_amount) as vendor_total,
                AVG(commission_percentage) as avg_commission_rate
            ')
            ->get()
            ->toArray();
    }

    /**
     * Recalculate commissions for service type (useful when commission rates change)
     *
     * @param string $serviceType
     * @param bool $affectPendingOnly
     * @return int Number of records updated
     */
    public static function recalculateCommissions($serviceType, $affectPendingOnly = true)
    {
        $query = CommissionEarning::where('service_type', $serviceType);

        if ($affectPendingOnly) {
            $query->where('status', 'pending');
        }

        $records = $query->get();
        $count = 0;

        foreach ($records as $earning) {
            $commissionConfig = Commission::where('service_type', $serviceType)
                ->where('is_active', true)
                ->first();

            if ($commissionConfig) {
                $calculations = CommissionEarning::calculateCommission(
                    $earning->booking_amount,
                    $commissionConfig->commission_percentage,
                    $earning->admin_percentage,
                    $earning->vendor_percentage
                );

                $earning->update([
                    'commission_percentage' => $commissionConfig->commission_percentage,
                    'total_commission' => $calculations['total_commission'],
                    'admin_amount' => $calculations['admin_amount'],
                    'vendor_amount' => $calculations['vendor_amount'],
                ]);

                $count++;
            }
        }

        return $count;
    }
}
