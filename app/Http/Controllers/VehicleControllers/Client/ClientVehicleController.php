<?php

namespace App\Http\Controllers\VehicleControllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ClientVehicleController extends Controller
{
    /** Home Page */
    public function home()
    {
        // -- CASE-INSENSITIVE BRANDS --
        $brands = Vehicle::query()
            ->whereNotNull('manufacturer')
            ->selectRaw('LOWER(manufacturer) AS key_name, MIN(manufacturer) AS display_name')
            ->groupBy('key_name')
            ->orderBy('display_name')
            ->get()
            ->map(fn($row) => [
                'name' => $row->display_name,
                'logo' => '/brand-logos/' . strtolower($row->display_name) . '.png',
            ]);

        // Land body types (from categories)
        $bodyTypes = VehicleCategory::where('type', 'land')
            ->orderBy('name')
            ->get()
            ->map(fn($c) => [
                'name' => $c->name,
                'icon' => '/body-icons/' . strtolower($c->name) . '.png',
            ]);

        // Vehicles: send browser-usable image URLs
        $vehicles = Vehicle::with(['landSpec', 'images', 'primaryImage'])
            ->active()
            ->type('land')
            ->take(12)
            ->get()
            ->map(function ($v) {
                $primaryUrl = $v->primary_image_url
                    ?? optional($v->images->sortByDesc('is_primary')->sortBy('sort_order')->first())->url;

                return [
                    'id'                   => $v->id,
                    'model'                => $v->model,
                    'manufacturer'         => $v->manufacturer,
                    'rental_price_per_day' => $v->rental_price_per_day,
                    'primary_image_url'    => $primaryUrl,
                    'landSpec'             => $v->landSpec,
                    'mileage_km'           => $v->mileage_km,
                    'passenger_capacity'   => $v->passenger_capacity,
                ];
            });

        $likedVehicleIds = Auth::check()
            ? Auth::user()->vehicleLikes()->pluck('vehicle_id')->toArray()
            : [];

        return Inertia::render('Web/home/HomePage', [
            'brands'          => $brands,
            'bodyTypes'       => $bodyTypes,
            'vehicles'        => $vehicles,
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
            'body_type',
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
            $brand = mb_strtolower(trim($filters['brand']));
            $query->whereRaw('LOWER(manufacturer) = ?', [$brand]);
        }

        if (!empty($filters['model'])) {
            $model = mb_strtolower(trim($filters['model']));
            $query->whereRaw('LOWER(model) = ?', [$model]);
        }

        $rawBodyType = $filters['bodyType'] ?? $filters['body_type'] ?? null;
        if (!empty($rawBodyType)) {
            $bodyType = mb_strtolower(trim($rawBodyType));
            $allowed = ['sedan','hatchback','suv','van','bus','pickup','jeep','other'];
            if (in_array($bodyType, $allowed, true)) {
                $query->whereHas('landSpec', fn($q) => $q->whereRaw('LOWER(body_type) = ?', [$bodyType]));
            }
        }

        $vehicles = $query->paginate(12)->withQueryString()
            ->through(function (Vehicle $v) {
                $primaryMedia = optional(
                    $v->images->sortByDesc('is_primary')->sortBy('sort_order')->first()
                );

                return [
                    'id'                   => $v->id,
                    'model'                => $v->model,
                    'manufacturer'         => $v->manufacturer,
                    'rental_price_per_day' => $v->rental_price_per_day,

                    'primary_image_url'    => $primaryMedia?->url,

                    'images' => $v->images->map(fn($m) => [
                        'id'         => $m->id,
                        'title'      => $m->title,
                        'url'        => $m->url,
                        'is_primary' => (bool) $m->is_primary,
                        'sort_order' => (int) $m->sort_order,
                    ])->values(),

                    'landSpec' => [
                        'fuel_type'         => $v->landSpec->fuel_type ?? null,
                        'transmission_type' => $v->landSpec->transmission_type ?? null,
                        'seats'             => $v->landSpec->seats ?? null,
                    ],

                    'mileage_km'         => $v->mileage_km,
                    'passenger_capacity' => $v->passenger_capacity,
                ];
            });

        $brandCollection = Vehicle::query()
            ->when(!empty($rawBodyType), function ($q) use ($rawBodyType) {
                $bt = mb_strtolower(trim($rawBodyType));
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
            $brand = mb_strtolower(trim($filters['brand']));
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
            'vehicles'         => $vehicles,
            'filters'          => [
                ...$filters,
                'bodyType' => $rawBodyType,
            ],
            'likedVehicleIds'  => $likedVehicleIds,
            'brandCollection'  => $brandCollection,
            'modelCollection'  => $modelCollection,
        ]);
    }

    /** Vehicle Details Page */
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
                'policy',
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
        $myReview   = Auth::check() ? $vehicle->reviews->firstWhere('client_id', Auth::id()) : null;
        $authUserId = Auth::id();

        // Frontend-friendly aliases (include URLs)
        $vehicle->setAttribute('landSpec', $vehicle->landSpec);
        $vehicle->setAttribute('primaryImage', $vehicle->primaryImage);
        $vehicle->setAttribute('primary_image_url', $vehicle->primary_image_url);
        $vehicle->setAttribute('images', $vehicle->images->map(fn($m) => [
            'id'         => $m->id,
            'title'      => $m->title,
            'url'        => $m->url,
            'is_primary' => (bool) $m->is_primary,
            'sort_order' => (int) $m->sort_order,
        ]));

        // Policy URLs for UI
        $vehicle->setAttribute('policy_pdf_url', $vehicle->policy_pdf_url);
        $vehicle->setAttribute('policy_stream_url', $vehicle->policy_stream_url);

        $similarVehicles = Vehicle::query()
            ->active()
            ->type('land')
            ->where('id', '!=', $vehicle->id)
            ->when($vehicle->category_id, fn($q) => $q->where('category_id', $vehicle->category_id))
            ->when($vehicle->manufacturer, fn($q) => $q->where('manufacturer', $vehicle->manufacturer))
            ->with(['primaryImage'])
            ->take(8)
            ->get()
            ->map(fn($v) => [
                'id'                   => $v->id,
                'model'                => $v->model,
                'manufacturer'         => $v->manufacturer,
                'primary_image_url'    => $v->primary_image_url,
                'rental_price_per_day' => $v->rental_price_per_day,
            ]);

        return Inertia::render('Web/home/land/VehicleDetails', [
            'vehicle'          => $vehicle,
            'similarVehicles'  => $similarVehicles,
            'ratingBreakdown'  => $ratingBreakdown,
            'likedVehicleIds'  => $likedVehicleIds,
            'myReview'         => $myReview,
            'authUserId'       => $authUserId,
        ]);
    }

    /** Stream the policy PDF inline for preview (client public route) */
    public function policyPreview(Vehicle $vehicle)
    {
        $policy = $vehicle->policy;
        abort_if(!$policy, 404, 'No policy found for this vehicle.');

        $disk = $policy->disk ?: 'public';
        $path = $policy->file_path;

        $filename = $policy->original_name ?: 'policy.pdf';
        $headers  = ['Content-Type' => $policy->mime_type ?: 'application/pdf'];

        return Storage::disk($disk)->response($path, $filename, $headers);
    }
}
