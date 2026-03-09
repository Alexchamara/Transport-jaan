<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class DriverController extends Controller
{
    /**
     * List all drivers with filters and stats.
     */
    public function index(Request $request)
    {
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
                'license_expiry'=> $driver->license_expiry
                    ? $driver->license_expiry->format('M d, Y')
                    : null,
                'status'        => $driver->status,
                'created_at'    => $driver->created_at->format('M d, Y'),
                'vendor_name'   => $driver->user?->name ?? 'N/A',
                'vendor_id'     => $driver->user_id,
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
     * Show a single driver's detail page.
     */
    public function show(Driver $driver)
    {
        $driver->load('user');

        return Inertia::render('Web/home/SuperAdmin/DriverDetail', [
            'driver' => [
                'id'               => $driver->id,
                'full_name'        => $driver->full_name,
                'email'            => $driver->email,
                'phone'            => $driver->phone,
                'vehicle_type'     => $driver->vehicle_type,
                'vehicle_no'       => $driver->vehicle_no,
                'license_no'       => $driver->license_no,
                'license_expiry'   => $driver->license_expiry
                    ? $driver->license_expiry->format('M d, Y')
                    : null,
                'status'           => $driver->status,
                'user_status'      => $driver->user?->status,
                'address'          => $driver->address,
                'notes'            => $driver->notes,
                'license_photo_url'=> $driver->license_photo_path
                    ? Storage::disk('public')->url($driver->license_photo_path)
                    : null,
                'nic_photo_url'    => $driver->nic_photo_path
                    ? Storage::disk('public')->url($driver->nic_photo_path)
                    : null,
                'created_at'       => $driver->created_at->format('M d, Y'),
                'created_at_human' => $driver->created_at->diffForHumans(),
            ],
            'vendor' => $driver->user ? [
                'id'     => $driver->user->id,
                'name'   => $driver->user->name,
                'email'  => $driver->user->email,
                'status' => $driver->user->status,
            ] : null,
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

        if ($validated['status'] === 'Active') {
            // Restore linked user account if it was suspended
            if ($driver->user && $driver->user->status === 'suspended') {
                $driver->user->update(['status' => 'verified']);
            }
        } elseif ($validated['status'] === 'Inactive') {
            // Suspend the linked user account
            if ($driver->user && $driver->user->status !== 'suspended') {
                $driver->user->update(['status' => 'suspended']);
            }
        }

        return redirect()->back()->with('success', 'Driver status updated successfully.');
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
