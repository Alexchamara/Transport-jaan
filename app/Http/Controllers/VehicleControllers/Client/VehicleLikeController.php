<?php

namespace App\Http\Controllers\VehicleControllers\Client;

use Illuminate\Http\Request;
use App\Models\VehicleLike;
use Illuminate\Support\Facades\Auth;
use Illuminate\Routing\Controller;

class VehicleLikeController extends Controller
{
    // Only authenticated users can access this controller
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function toggle(Request $request)
    {
        $user = Auth::user(); // guaranteed by middleware
        $vehicleId = $request->vehicle_id;

        // Check if like already exists
        $like = VehicleLike::where('user_id', $user->id)
            ->where('vehicle_id', $vehicleId)
            ->first();

        if ($like) {
            $like->delete();
        } else {
            VehicleLike::create([
                'user_id' => $user->id,
                'vehicle_id' => $vehicleId,
            ]);
        }

        // Return the updated list of liked vehicle IDs for the frontend
        $likedVehicleIds = $user->vehicleLikes()->pluck('vehicle_id')->toArray();

        return response()->json([
            'likedVehicleIds' => $likedVehicleIds,
        ]);
    }
}
