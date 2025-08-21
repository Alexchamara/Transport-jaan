<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClientVehicleController extends Controller
{
    /**
     * Home Page
     */
    public function home()
    {
        // Fetch unique brands
        $brands = Vehicle::select('manufacturer')
            ->distinct()
            ->get()
            ->map(fn($v) => [
                'name' => $v->manufacturer,
                'logo' => '/brand-logos/' . strtolower($v->manufacturer) . '.png',
            ]);

        // Fetch body types for land vehicles
        $bodyTypes = VehicleCategory::where('type', 'land')
            ->get()
            ->map(fn($c) => [
                'name' => $c->name,
                'icon' => '/body-icons/' . strtolower($c->name) . '.png',
            ]);

        // Sample vehicles for homepage
        $vehicles = Vehicle::with(['landSpec', 'primaryImage'])
            ->active()
            ->type('land')
            ->take(12)
            ->get()
            ->map(fn($v) => [
                'id' => $v->id,
                'model' => $v->model,
                'manufacturer' => $v->manufacturer,
                'rental_price_per_day' => $v->rental_price_per_day,
                'primary_image' => $v->primaryImage?->path ?? null,
                'landSpec' => $v->landSpec,
            ]);

        // Fetch liked vehicles for authenticated user
        $likedVehicleIds = Auth::check()
            ? Auth::user()->vehicleLikes()->pluck('vehicle_id')->toArray()
            : [];

        return Inertia::render('Web/home/HomePage', [
            'brands' => $brands,
            'bodyTypes' => $bodyTypes,
            'vehicles' => $vehicles,
            'likedVehicleIds' => $likedVehicleIds,
        ]);
    }

    /**
     * Vehicle List with filters
     */
    public function vehicleList(Request $request)
    {
        $query = Vehicle::with(['landSpec', 'primaryImage'])
            ->active()
            ->type('land');

        // Apply filters
        if ($request->brand) {
            $query->where('manufacturer', $request->brand);
        }
        if ($request->body_type) {
            $query->whereHas('landSpec', function ($q) use ($request) {
                $q->whereRaw('LOWER(body_type) = ?', [strtolower($request->body_type)]);
            });
        }

        $vehicles = $query->paginate(12)->withQueryString();

        // Get liked vehicles for the authenticated user
        $likedVehicleIds = Auth::check()
            ? Auth::user()->vehicleLikes()->pluck('vehicle_id')->toArray()
            : [];

        return Inertia::render('Web/home/vehicleList', [
            'vehicles' => $vehicles,
            'filters' => $request->only([
                'pickupLocation',
                'pickupDate',
                'dropoffLocation',
                'dropoffDate',
                'brand',
                'body_type'
            ]),
            'likedVehicleIds' => $likedVehicleIds,
        ]);
    }

    /**
     * Vehicle Details Page (id or registration_number)
     */
    // at top: use Illuminate\Support\Facades\Auth;

    public function vehicleDetails($idOrSlug)
    {
        $base = Vehicle::query()
            ->with([
                'landSpec',
                'images' => fn($q) => $q->orderByDesc('is_primary')->orderBy('sort_order')->orderBy('id'),
                'primaryImage',
                'documents',
                'crewMembers',
                'category',
                'provider',
                'reviews' => fn($q) => $q->latest(),
                'reviews.client:id,name,country', // IMPORTANT: client relation, not user
            ])
            ->withAvg('reviews as rating_avg', 'rating')
            ->withCount('reviews as reviews_count')
            ->active()
            ->type('land');

        $vehicle = (clone $base)
            ->when(
                is_numeric($idOrSlug),
                fn($q) => $q->where('id', (int) $idOrSlug),
                fn($q) => $q->where('registration_number', $idOrSlug)
            )
            ->firstOrFail();

        // Histogram (5..1)
        $rawBreakdown = $vehicle->reviews()
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating');

        $ratingBreakdown = collect([5, 4, 3, 2, 1])
            ->mapWithKeys(fn($star) => [$star => (int) ($rawBreakdown[$star] ?? 0)]);

        // Likes (unchanged)
        $likedVehicleIds = Auth::check()
            ? Auth::user()->vehicleLikes()->pluck('vehicle_id')->toArray()
            : [];
        $vehicle->setAttribute('is_liked', Auth::check() && in_array($vehicle->id, $likedVehicleIds, true));

        // Authoritative: THIS logged-in user's review (null if none / not logged in)
        $myReview = Auth::check()
            ? $vehicle->reviews->firstWhere('client_id', Auth::id())
            : null;

        // Also pass the current auth user id so the front end can reset when it changes
        $authUserId = Auth::id();

        // (Your similarVehicles code unchanged…)

        return Inertia::render('Web/home/land/VehicleDetails', [
            'vehicle' => $vehicle,
            'similarVehicles' => $similarVehicles ?? [],
            'ratingBreakdown' => $ratingBreakdown,
            'likedVehicleIds' => $likedVehicleIds,
            'myReview' => $myReview,     // <- authoritative
            'authUserId' => $authUserId,   // <- helps reset on account switch
        ]);
    }


}
