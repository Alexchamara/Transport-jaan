<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\Driver;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class DriverController extends Controller
{
    /**
     * Auto-deactivate any Active drivers whose license_expiry has passed.
     * Called at the start of index() and show() so the admin always
     * sees up-to-date statuses without waiting for the nightly cron.
     */
    private function expireOverdueLicenses(): void
    {
        Driver::with('user')
            ->whereNotNull('license_expiry')
            ->whereDate('license_expiry', '<', today())
            ->where('status', 'Active')
            ->get()
            ->each(function (Driver $driver) {
                $driver->update(['status' => 'Inactive']);
            });
    }

    /**
     * List all drivers with filters and stats.
     */
    public function index(Request $request)
    {
        // Instantly deactivate any drivers whose license just expired
        $this->expireOverdueLicenses();

        $search          = $request->get('search', '');
        $statusFilter    = $request->get('status', 'all');
        $vehicleTypeFilter = $request->get('vehicle_type', 'all');
        $perPage         = $request->get('per_page', 10);

        $query = Driver::with('user');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('vehicle_no', 'like', "%{$search}%")
                  ->orWhere('license_no', 'like', "%{$search}%");
            });
        }

        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        if ($vehicleTypeFilter !== 'all') {
            $query->where('vehicle_type', $vehicleTypeFilter);
        }

        $paginated = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $drivers = $paginated->getCollection()->map(function ($driver) {
            return [
                'id'            => $driver->id,
                'full_name'     => $driver->full_name,
                'email'         => $driver->email ?? 'N/A',
                'phone'         => $driver->phone,
                'vehicle_type'  => $driver->vehicle_type,
                'vehicle_no'    => $driver->vehicle_no,
                'license_no'    => $driver->license_no,
                'license_expiry'        => $driver->license_expiry
                    ? $driver->license_expiry->format('M d, Y')
                    : null,
                'status'                => $driver->status,
                'license_review_status' => $driver->license_review_status,
                'created_at'            => $driver->created_at->format('M d, Y'),
                'vendor_name'           => $driver->user?->name ?? 'N/A',
                'vendor_id'             => $driver->user_id,
            ];
        });

        $totalDrivers  = Driver::count();
        $activeCount   = Driver::where('status', 'Active')->count();
        $inactiveCount = Driver::where('status', 'Inactive')->count();
        $vehicleTypes  = Driver::select('vehicle_type')
            ->distinct()
            ->whereNotNull('vehicle_type')
            ->orderBy('vehicle_type')
            ->pluck('vehicle_type');

        return Inertia::render('Web/home/SuperAdmin/Drivers', [
            'drivers'      => $drivers->values(),
            'pagination'   => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
                'from'         => $paginated->firstItem(),
                'to'           => $paginated->lastItem(),
            ],
            'counts'       => [
                'total'    => $totalDrivers,
                'active'   => $activeCount,
                'inactive' => $inactiveCount,
            ],
            'filters'      => [
                'search'       => $search,
                'status'       => $statusFilter,
                'vehicle_type' => $vehicleTypeFilter,
                'per_page'     => $perPage,
            ],
            'vehicleTypes' => $vehicleTypes,
        ]);
    }

    /**
     * Helper: Find photo URL from storage if database path is missing
     */
    private function findPhotoUrl($driver, $type)
    {
        // First try database path
        if ($type === 'license' && $driver->license_photo_path) {
            return Storage::disk('public')->url($driver->license_photo_path);
        }
        if ($type === 'nic' && $driver->nic_photo_path) {
            return Storage::disk('public')->url($driver->nic_photo_path);
        }

        // If no database path, search storage directory for any matching file
        $storageDir = $type === 'license' ? 'drivers/licenses' : 'drivers/nics';
        $files = Storage::disk('public')->files($storageDir);
        
        if (!empty($files)) {
            // Return first available file (most recent upload)
            return Storage::disk('public')->url(reset($files));
        }

        return null;
    }

    /**
     * Show a single driver's detail page.
     */
    public function show(Driver $driver)
    {
        $driver->load('user');

        // Deactivate this driver on-the-fly if their license just expired
        if ($driver->license_expiry && $driver->license_expiry->isPast() && $driver->status === 'Active') {
            $driver->update(['status' => 'Inactive']);
            $driver->refresh();
        }

        // Fetch bookings for all vehicles owned by this driver's vendor
        $vendorId = $driver->user_id;
        $trips = Booking::with(['schedule', 'client', 'vehicle'])
            ->whereHas('vehicle', fn ($q) => $q->where('provider_id', $vendorId))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($b) => [
                'id'               => $b->id,
                'booking_ref'      => 'BK-' . str_pad($b->id, 5, '0', STR_PAD_LEFT),
                'client_name'      => $b->client?->name ?? '—',
                'vehicle_name'     => trim(($b->vehicle?->manufacturer ?? '') . ' ' . ($b->vehicle?->model ?? '')) ?: '—',
                'vehicle_plate'    => $b->vehicle?->registration_number ?? '—',
                'pickup_location'  => $b->schedule?->pickup_location ?? '—',
                'dropoff_location' => $b->schedule?->dropoff_location ?? '—',
                'pickup_at'        => $b->schedule?->pickup_at?->format('M d, Y') ?? '—',
                'dropoff_at'       => $b->schedule?->dropoff_at?->format('M d, Y') ?? '—',
                'total_amount'     => $b->total_amount,
                'currency'         => $b->currency ?? 'LKR',
                'status'           => $b->status,
                'created_at'       => $b->created_at->format('M d, Y'),
            ]);

        $payments = BookingPayment::with(['booking.schedule', 'booking.client', 'booking.vehicle'])
            ->whereHas('booking.vehicle', fn ($q) => $q->where('provider_id', $vendorId))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($p) => [
                'id'           => $p->id,
                'booking_ref'  => 'BK-' . str_pad($p->booking_id, 5, '0', STR_PAD_LEFT),
                'client_name'  => $p->booking?->client?->name ?? '—',
                'amount_paid'  => $p->amount_paid,
                'currency'     => $p->booking?->currency ?? 'LKR',
                'method'       => $p->method,
                'option'       => $p->option,
                'status'       => $p->status,
                'tx_reference' => $p->tx_reference ?? $p->slip_number ?? '—',
                'paid_at'      => $p->created_at->format('M d, Y'),
            ]);

        return Inertia::render('Web/home/SuperAdmin/DriverDetail', [
            'driver' => [
                'id'               => $driver->id,
                'full_name'        => $driver->full_name,
                'email'            => $driver->email,
                'phone'            => $driver->phone,
                'vehicle_type'     => $driver->vehicle_type,
                'vehicle_no'       => $driver->vehicle_no,
                'license_no'       => $driver->license_no,
                'license_expiry'             => $driver->license_expiry
                    ? $driver->license_expiry->format('M d, Y')
                    : null,
                'status'                     => $driver->status,
                'user_status'                => $driver->user?->status,
                'address'                    => $driver->address,
                'notes'                      => $driver->notes,
                'license_photo_url'          => $this->findPhotoUrl($driver, 'license'),
                'nic_photo_url'              => $this->findPhotoUrl($driver, 'nic'),
                // License renewal review fields
                'license_review_status'      => $driver->license_review_status,
                'pending_license_no'         => $driver->pending_license_no,
                'pending_license_expiry'     => $driver->pending_license_expiry
                    ? $driver->pending_license_expiry->format('M d, Y')
                    : null,
                'pending_license_photo_url'  => $driver->pending_license_photo_path
                    ? Storage::disk('public')->url($driver->pending_license_photo_path)
                    : null,
                'created_at'                 => $driver->created_at->format('M d, Y'),
                'created_at_human'           => $driver->created_at->diffForHumans(),
            ],
            'vendor' => $driver->user ? [
                'id'     => $driver->user->id,
                'name'   => $driver->user->name,
                'email'  => $driver->user->email,
                'status' => $driver->user->status,
            ] : null,
            'trips'    => $trips->values(),
            'payments' => $payments->values(),
        ]);
    }

    /**
     * Change driver status (Active / Inactive).
     * Setting Active also restores the linked user from 'suspended' to 'verified'.
     * Setting Inactive also suspends the linked user account.
     */
    public function changeStatus(Request $request, Driver $driver)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['Active', 'Inactive'])],
        ]);

        $driver->load('user');
        $driver->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Driver status updated successfully.');
    }

    /**
     * SuperAdmin approves or rejects a vendor-submitted license renewal.
     * Approve: copies pending_* data to the live license fields, sets status Active.
     * Reject:  discards the pending photo, clears pending fields.
     */
    public function verifyLicense(Request $request, Driver $driver)
    {
        $validated = $request->validate([
            'action' => ['required', Rule::in(['approve', 'reject'])],
        ]);

        $driver->load('user');

        if ($validated['action'] === 'approve') {
            $approveData = [
                'status'                     => 'Active',
                'license_review_status'      => 'approved',
                'pending_license_no'         => null,
                'pending_license_expiry'     => null,
                'pending_license_photo_path' => null,
            ];

            // Promote pending license data to the live fields
            if ($driver->pending_license_no) {
                $approveData['license_no'] = $driver->pending_license_no;
            }
            if ($driver->pending_license_expiry) {
                $approveData['license_expiry'] = $driver->pending_license_expiry;
            }
            if ($driver->pending_license_photo_path) {
                // Delete the old license photo and replace with the approved one
                if ($driver->license_photo_path) {
                    Storage::disk('public')->delete($driver->license_photo_path);
                }
                $approveData['license_photo_path'] = $driver->pending_license_photo_path;
            }

            $driver->update($approveData);

            return redirect()->back()->with('success', 'License approved. Driver has been reactivated.');
        }

        // Reject: discard the pending photo and mark as rejected
        $rejectData = [
            'license_review_status'      => 'rejected',
            'pending_license_no'         => null,
            'pending_license_expiry'     => null,
            'pending_license_photo_path' => null,
        ];

        if ($driver->pending_license_photo_path) {
            Storage::disk('public')->delete($driver->pending_license_photo_path);
        }

        $driver->update($rejectData);

        return redirect()->back()->with('success', 'License submission rejected. The vendor has been notified to re-submit.');
    }

    /**
     * SuperAdmin approves a new driver registration.
     * Sets status to Active and records the approval metadata.
     */
    public function approveDriver(Request $request, Driver $driver)
    {
        // Only approve drivers that are currently Inactive (pending approval)
        if ($driver->status === 'Active') {
            return redirect()->back()->with('warning', 'This driver is already approved.');
        }

        $driver->update([
            'status'             => 'Active',
            'driver_approved_by' => auth()->id(),
            'driver_approved_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Driver registration approved. Driver is now active.');
    }

    /**
     * Delete a driver record.
     */
    public function destroy(Driver $driver)
    {
        // Remove stored documents if they exist
        if ($driver->license_photo_path) {
            Storage::disk('public')->delete($driver->license_photo_path);
        }
        if ($driver->nic_photo_path) {
            Storage::disk('public')->delete($driver->nic_photo_path);
        }

        $driver->delete();

        return redirect('/superadmin/users/drivers')->with('success', 'Driver deleted successfully.');
    }
}
