<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\CommissionEarning;
use App\Models\Commission;
use App\Services\CommissionCalculationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommissionEarningsController extends Controller
{
    /**
     * Show commission earnings dashboard
     */
    public function index()
    {
        $adminSummary = CommissionCalculationService::getAdminSummary();
        $breakdown = CommissionCalculationService::getCommissionBreakdown();

        $earnings = CommissionEarning::with('vendor')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Web/home/SuperAdmin/CommissionEarnings', [
            'earnings' => $earnings,
            'adminSummary' => $adminSummary,
            'breakdown' => $breakdown,
        ]);
    }

    /**
     * Get earnings by service type
     */
    public function byServiceType($serviceType)
    {
        $earnings = CommissionEarning::where('service_type', $serviceType)
            ->with('vendor')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $summary = CommissionEarning::where('service_type', $serviceType)
            ->where('status', 'paid')
            ->selectRaw('
                COUNT(*) as count,
                SUM(booking_amount) as total_bookings,
                SUM(total_commission) as total_commission,
                SUM(admin_amount) as admin_total,
                SUM(vendor_amount) as vendor_total
            ')
            ->first();

        return response()->json([
            'data' => $earnings,
            'summary' => $summary,
        ]);
    }

    /**
     * Get vendor earnings
     */
    public function vendorEarnings($vendorId)
    {
        $earnings = CommissionEarning::where('vendor_id', $vendorId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $summary = CommissionCalculationService::getVendorSummary($vendorId);

        return response()->json([
            'data' => $earnings,
            'summary' => $summary,
        ]);
    }

    /**
     * Get earnings report (filterable)
     */
    public function report(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $serviceType = $request->query('service_type');
        $vendorId = $request->query('vendor_id');
        $status = $request->query('status');

        $query = CommissionEarning::query();

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        if ($serviceType) {
            $query->where('service_type', $serviceType);
        }

        if ($vendorId) {
            $query->where('vendor_id', $vendorId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $earnings = $query->with('vendor')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        $summary = CommissionEarning::selectRaw('
            COUNT(*) as count,
            SUM(booking_amount) as total_bookings,
            SUM(total_commission) as total_commission,
            SUM(admin_amount) as admin_total,
            SUM(vendor_amount) as vendor_total
        ')
            ->where('status', 'paid')
            ->first();

        return response()->json([
            'data' => $earnings,
            'summary' => $summary,
        ]);
    }

    /**
     * Export earnings report
     */
    public function export(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $earnings = CommissionEarning::where('status', 'paid')
            ->when($startDate, fn($q) => $q->whereDate('created_at', '>=', $startDate))
            ->when($endDate, fn($q) => $q->whereDate('created_at', '<=', $endDate))
            ->with('vendor')
            ->orderBy('created_at', 'desc')
            ->get();

        $csv = fopen('php://memory', 'r+');
        fputcsv($csv, [
            'Booking Type',
            'Booking ID',
            'Service Type',
            'Vendor',
            'Booking Amount',
            'Commission %',
            'Total Commission',
            'Admin Amount',
            'Vendor Amount',
            'Status',
            'Paid At',
        ]);

        foreach ($earnings as $earning) {
            fputcsv($csv, [
                $earning->booking_type,
                $earning->booking_id,
                $earning->service_type,
                $earning->vendor?->name ?? 'N/A',
                $earning->booking_amount,
                $earning->commission_percentage,
                $earning->total_commission,
                $earning->admin_amount,
                $earning->vendor_amount,
                $earning->status,
                $earning->paid_at?->format('Y-m-d H:i:s'),
            ]);
        }

        rewind($csv);
        $content = stream_get_contents($csv);
        fclose($csv);

        return response()->streamDownload(
            fn() => print($content),
            'commission-earnings-' . now()->format('Y-m-d-H-i-s') . '.csv',
            ['Content-Type' => 'text/csv']
        );
    }
}
