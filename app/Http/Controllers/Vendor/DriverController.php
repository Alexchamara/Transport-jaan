<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    /**
     * GET /vendor/drivers
     * Search + sort + paginate JSON.
     */
    public function index(Request $request)
    {
        $query = Driver::query();

        // 🔎 Search
        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('license_no', 'like', "%{$search}%")
                  ->orWhere('vehicle_no', 'like', "%{$search}%")
                  ->orWhere('vehicle_type', 'like', "%{$search}%")
                  ->orWhere('status', 'like', "%{$search}%");
            });
        }

        // ↕ Sorting
        $sort = $request->query('sort', 'created_at');
        $dir  = strtolower($request->query('dir', 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowed = ['full_name','phone','vehicle_no','vehicle_type','license_no','license_expiry','status','created_at'];
        if (!in_array($sort, $allowed)) $sort = 'created_at';

        $query->orderBy($sort, $dir);

        // 📄 Pagination
        $perPage = (int) $request->query('per_page', 10);

        return response()->json($query->paginate($perPage));
    }

    /**
     * POST /vendor/drivers
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'full_name'      => 'required|string|max:255',
            'phone'          => 'required|string|max:50',
            'email'          => 'nullable|email|max:255',
            'license_no'     => 'required|string|max:100',
            'license_expiry' => 'nullable|date',
            'vehicle_type'   => 'required|string|max:100',
            'vehicle_no'     => 'required|string|max:100',
            'status'         => 'nullable|in:Active,Inactive',
            'address'        => 'nullable|string',
            'notes'          => 'nullable|string',
        ]);

        $driver = Driver::create($data);
        return response()->json($driver, 201);
    }

    /**
     * GET /vendor/drivers/{driver}
     */
    public function show(Driver $driver)
    {
        return response()->json($driver);
    }

    /**
     * PUT /vendor/drivers/{driver}
     */
    public function update(Request $request, Driver $driver)
    {
        $data = $request->validate([
            'full_name'      => 'sometimes|required|string|max:255',
            'phone'          => 'sometimes|required|string|max:50',
            'email'          => 'nullable|email|max:255',
            'license_no'     => 'sometimes|required|string|max:100',
            'license_expiry' => 'nullable|date',
            'vehicle_type'   => 'sometimes|required|string|max:100',
            'vehicle_no'     => 'sometimes|required|string|max:100',
            'status'         => 'nullable|in:Active,Inactive',
            'address'        => 'nullable|string',
            'notes'          => 'nullable|string',
        ]);

        $driver->update($data);
        return response()->json($driver);
    }

    /**
     * DELETE /vendor/drivers/{driver}
     */
    public function destroy(Driver $driver)
    {
        $driver->delete();
        return response()->json(null, 204);
    }
}
