<?php

namespace App\Http\Controllers\VehicleControllers\Client;

use Illuminate\Http\Request;
use App\Models\VehicleLike;
use Illuminate\Support\Facades\Auth;
use Illuminate\Routing\Controller;

class VehicleLikeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
        ]);

        $user = Auth::user(); // guaranteed by middleware
        $vehicleId = (int) $request->vehicle_id;

        $like = VehicleLike::where('user_id', $user->id)
            ->where('vehicle_id', $vehicleId)
            ->first();

        if ($like) {
            $like->delete();
        } else {
            // Slightly safer if concurrent calls happen
            VehicleLike::firstOrCreate([
                'user_id'    => $user->id,
                'vehicle_id' => $vehicleId,
            ]);
        }

        $likedVehicleIds = $user->vehicleLikes()->pluck('vehicle_id')->toArray();

        return response()->json([
            'likedVehicleIds' => $likedVehicleIds,
        ]);
    }
}
