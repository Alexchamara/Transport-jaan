<?php

namespace App\Http\Controllers\VehicleControllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClientVehicleController extends Controller
{
    /** Home Page */
    public function home()
    {
        // -- CASE-INSENSITIVE BRANDS --
        // Collapse Toyota, TOYOTA, toyota into one entry and pick a display value
        $brands = Vehicle::query()
            ->whereNotNull('manufacturer')
            ->selectRaw('LOWER(manufacturer) AS key_name, MIN(manufacturer) AS display_name')
            ->groupBy('key_name')
            ->orderBy('display_name')
            ->get()
            ->map(fn($row) => [
                'name' => $row->display_name, // nice-looking label from DB
                'logo' => '/brand-logos/' . strtolower($row->display_name) . '.png',
            ]);

        // Land body types (unchanged)
        $bodyTypes = VehicleCategory::where('type', 'land')
            ->orderBy('name')
            ->get()
            ->map(fn($c) => [
                'name' => $c->name,
                'icon' => '/body-icons/' . strtolower($c->name) . '.png',
            ]);

        // Sample vehicles (unchanged)
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
                'primary_image' => $v->primaryImage?->path,
                'landSpec' => $v->landSpec,
            ]);

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

    /** Vehicle List with filters (brand/model case-insensitive) */
    public function vehicleList(Request $request)
    {
        $filters = $request->only([
            'pickupLocation',
            'pickupDate',
            'dropoffLocation',
            'dropoffDate',
            'brand',
            'model',
            'bodyType',
        ]);

        $query = Vehicle::with([
            'landSpec',
            'images' => fn($q) => $q->orderByDesc('is_primary')
                ->orderBy('sort_order')
                ->orderBy('id'),
        ])
            ->active()
            ->type('land');

        if (!empty($filters['brand'])) {
            $brand = mb_strtolower($filters['brand']);
            $query->whereRaw('LOWER(manufacturer) = ?', [$brand]);
        }

        if (!empty($filters['model'])) {
            $model = mb_strtolower($filters['model']);
            $query->whereRaw('LOWER(model) = ?', [$model]);
        }

        if (!empty($filters['bodyType'])) {
            $bodyType = mb_strtolower($filters['bodyType']);
            $query->whereHas('landSpec', fn($q) => $q->whereRaw('LOWER(body_type) = ?', [$bodyType]));
        }

        $vehicles = $query->paginate(12)->withQueryString()
            ->through(function (Vehicle $v) {
                // compute a single primary image path for consistent front-end usage
                $primary = optional(
                    $v->images->sortByDesc('is_primary')->sortBy('sort_order')->first()
                )->path;

                return [
                    'id' => $v->id,
                    'model' => $v->model,
                    'manufacturer' => $v->manufacturer,
                    'rental_price_per_day' => $v->rental_price_per_day,

                    // NEW: always present string (usable as `/storage/{primary_image}`)
                    'primary_image' => $primary,

                    // keep your existing list format too
                    'images' => $v->images->map(fn($m) => [
                        'image_path' => $m->path,   // old consumer
                        'path' => $m->path,   // future-proof
                    ])->values(),

                    // include minimal spec bits used by the cards
                    'landSpec' => [
                        'fuel_type' => $v->landSpec->fuel_type ?? null,
                        'transmission_type' => $v->landSpec->transmission_type ?? null,
                        'seats' => $v->landSpec->seats ?? null,
                    ],
                    'passenger_capacity' => $v->passenger_capacity,
                ];
            });

        $brandCollection = Vehicle::query()
            ->when(!empty($filters['bodyType']), function ($q) use ($filters) {
                $bt = mb_strtolower($filters['bodyType']);
                $q->whereHas('landSpec', fn($qq) => $qq->whereRaw('LOWER(body_type) = ?', [$bt]));
            })
            ->selectRaw('LOWER(manufacturer) AS key_name, MIN(manufacturer) AS display_name')
            ->whereNotNull('manufacturer')
            ->groupBy('key_name')
            ->orderBy('display_name')
            ->get()
            ->map(fn($row) => $row->display_name);

        $modelQuery = Vehicle::query();
        if (!empty($filters['brand'])) {
            $brand = mb_strtolower($filters['brand']);
            $modelQuery->whereRaw('LOWER(manufacturer) = ?', [$brand]);
        }
        $modelCollection = $modelQuery
            ->whereNotNull('model')
            ->selectRaw('LOWER(model) AS key_name, MIN(model) AS display_name')
            ->groupBy('key_name')
            ->orderBy('display_name')
            ->pluck('display_name');

        $likedVehicleIds = Auth::check()
            ? Auth::user()->vehicleLikes()->pluck('vehicle_id')->toArray()
            : [];

        return Inertia::render('Web/home/vehicleList', [
            'vehicles' => $vehicles,
            'filters' => $filters,
            'likedVehicleIds' => $likedVehicleIds,
            'brandCollection' => $brandCollection,
            'modelCollection' => $modelCollection,
        ]);
    }

    /** Vehicle Details Page (unchanged) */
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
                'reviews.client:id,name,email,country',
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

        // Ratings histogram
        $rawBreakdown = $vehicle->reviews()
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating');

        $ratingBreakdown = collect([5, 4, 3, 2, 1])
            ->mapWithKeys(fn($star) => [$star => (int) ($rawBreakdown[$star] ?? 0)]);

        // Likes / my review
        $likedVehicleIds = Auth::check()
            ? Auth::user()->vehicleLikes()->pluck('vehicle_id')->toArray()
            : [];
        $vehicle->setAttribute('is_liked', Auth::check() && in_array($vehicle->id, $likedVehicleIds, true));
        $myReview = Auth::check() ? $vehicle->reviews->firstWhere('client_id', Auth::id()) : null;
        $authUserId = Auth::id();

        // ---- IMPORTANT: add camelCase aliases for the frontend ----
        $vehicle->setAttribute('landSpec', $vehicle->landSpec);           // <-- alias for land_spec
        $vehicle->setAttribute('primaryImage', $vehicle->primaryImage);   // (optional) alias for primary_image
        $vehicle->setAttribute('images', $vehicle->images);               // keep images array

        $similarVehicles = Vehicle::query()
            ->active()
            ->type('land')
            ->where('id', '!=', $vehicle->id)
            ->when($vehicle->category_id, fn($q) => $q->where('category_id', $vehicle->category_id))
            ->when($vehicle->manufacturer, fn($q) => $q->where('manufacturer', $vehicle->manufacturer))
            ->with(['primaryImage'])
            ->take(8)
            ->get();

        return Inertia::render('Web/home/land/VehicleDetails', [
            'vehicle' => $vehicle,
            'similarVehicles' => $similarVehicles,
            'ratingBreakdown' => $ratingBreakdown,
            'likedVehicleIds' => $likedVehicleIds,
            'myReview' => $myReview,
            'authUserId' => $authUserId,
        ]);
    }

}
