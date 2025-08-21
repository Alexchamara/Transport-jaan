<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\VehicleReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Routing\Controller;



class VehicleReviewController extends Controller
{
    public function __construct()
    {
        // Only logged-in users may create/delete; listing is public
        $this->middleware('auth')->only(['store', 'destroy']);
    }

    /**
     * Public: list all reviews for a vehicle (JSON).
     */
    public function index(Vehicle $vehicle)
    {
        $reviews = $vehicle->reviews()
            ->with(['client:id,name,country']) // select what you need
            ->latest()
            ->get(['id','vehicle_id','client_id','rating','comment','created_at']);

        return response()->json([
            'vehicle_id' => $vehicle->id,
            'reviews'    => $reviews,
        ]);
    }

    /**
     * Logged-in CLIENT creates/updates their review.
     */
    public function store(Request $request, Vehicle $vehicle)
    {
        $user = Auth::user();

        // allow only users with role=client to post
        if (!$user || $user->role !== 'client') {
            abort(403, 'Only clients can post reviews.');
        }

        $data = $request->validate([
            'rating'  => ['required','integer','between:1,5'],
            'comment' => ['nullable','string','max:2000'],
        ]);

        VehicleReview::updateOrCreate(
            ['vehicle_id' => $vehicle->id, 'client_id' => $user->id],
            ['rating' => $data['rating'], 'comment' => $data['comment'] ?? null]
        );

        return back();
    }

    /**
     * Optional: client deletes their own review.
     */
    public function destroy(Vehicle $vehicle)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'client') {
            abort(403, 'Only clients can delete reviews.');
        }

        VehicleReview::where('vehicle_id', $vehicle->id)
            ->where('client_id', $user->id)
            ->delete();

        return back();
    }
}
