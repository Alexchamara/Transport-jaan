<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Models\AirVehicleSpec;
use App\Models\SeaVehicleSpec;
use App\Models\LandVehicleSpec;
use App\Models\VehicleMedia;
use App\Models\VehicleDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class VehicleController extends Controller
{
    public function index()
    {
        return redirect()->route('vendors.units');
    }

    /**
     * GET /vendor/vehicles/list  → JSON for Units grid
     */
    public function list(Request $request)
    {
        $userId = $request->user()->id;

        $query = Vehicle::query()
            ->where('provider_id', $userId)
            ->latest('id');

        if ($q = trim((string) $request->query('q', ''))) {
            $query->where(function ($qq) use ($q) {
                $qq->where('model', 'like', "%{$q}%")
                    ->orWhere('manufacturer', 'like', "%{$q}%")
                    ->orWhere('registration_number', 'like', "%{$q}%");
            });
        }

        if ($status = trim((string) $request->query('status', ''))) {
            if (strtolower($status) === 'available') {
                $query->where('approval_status', 'approved')
                      ->whereIn('status', ['active','available','ACTIVE','AVAILABLE']);
            } elseif (strtolower($status) === 'pending') {
                $query->where('approval_status', 'pending');
            }
        }

        if ($type = trim((string) $request->query('type', ''))) {
            $query->where('type', strtolower($type)); // land|air|sea
        }

        $perPage   = min(100, max(1, (int) $request->query('per_page', 10)));
        $paginator = $query->paginate($perPage);

        $data = $paginator->getCollection()->map(function (Vehicle $v) {
            $land = LandVehicleSpec::where('vehicle_id', $v->id)->first();
            $air  = AirVehicleSpec::where('vehicle_id', $v->id)->first();
            $sea  = SeaVehicleSpec::where('vehicle_id', $v->id)->first();

            // Primary first, then sort_order
            $images = VehicleMedia::where('vehicle_id', $v->id)
                ->where('media_type', 'image')
                ->orderBy('is_primary', 'desc')
                ->orderBy('sort_order')
                ->pluck('path')
                ->values()
                ->all();

            $isApproved  = strtolower((string) $v->approval_status) === 'approved';
            $isActive    = in_array(strtolower((string) $v->status), ['active','available'], true);
            $statusLabel = $isApproved && $isActive ? 'Available'
                : (strtolower((string) $v->approval_status) === 'rejected' ? 'Rejected' : 'Pending');

            $fuel         = $land?->fuel_type ?? $air?->fuel_type ?? $sea?->fuel_type ?? null;
            $transmission = $land?->transmission_type ?? null;

            return [
                'id'           => $v->id,
                'brand'        => $v->manufacturer,
                'model'        => $v->model,
                'price'        => (float) ($v->rental_price_per_day ?? 0),
                'status'       => $statusLabel,
                'unitsCount'   => 1,
                'mileage'      => $v->mileage_km !== null ? number_format((int) $v->mileage_km) : null,
                'transmission' => $transmission ? ucfirst($transmission) : null,
                'capacity'     => $v->passenger_capacity ? ($v->passenger_capacity . ' Person') : null,
                'fuelType'     => $fuel ? ucfirst($fuel) : null,
                'image'        => $images[0] ?? null, // ✅ first/photo thumb
                'images'       => $images,
                'raw'          => [
                    'approval_status' => $v->approval_status,
                    'status'          => $v->status,
                    'type'            => $v->type,
                ],
            ];
        })->values();

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    /**
     * POST /vendor/vehicles/store  → from AddUnit form
     */
    public function store(Request $request)
    {
        // -------- Normalize --------
        $type = strtolower((string) $request->input('category', ''));
        if (! in_array($type, ['land','air','sea'], true)) {
            $map = ['Land' => 'land','Air' => 'air','Sea' => 'sea'];
            $type = $map[$request->input('category', '')] ?? 'land';
        }

        $conditionRaw = strtolower((string) $request->input('condition', ''));
        $condition = match ($conditionRaw) {
            'new' => 'new',
            'refurbished' => 'refurbished',
            'excellent','good','fair','needs repair','needs_repair' => 'used',
            default => $conditionRaw ?: null,
        };

        $ownershipRaw = strtolower((string) $request->input('ownershipType', ''));
        $ownership = match ($ownershipRaw) {
            'owned'     => 'company_owned',
            'leased'    => 'leased',
            'rented'    => 'partner_owned',
            'financed'  => 'partner_owned',
            default     => null,
        };

        $regNormalized = strtoupper(preg_replace('/[\s\-]+/', '', trim((string) $request->input('number', '')))) ?: null;

        $request->merge([
            'category'          => $type,
            'number'            => $regNormalized,
            'condition'         => $condition,
            'ownershipType'     => $ownership,
            'gps'               => $request->boolean('gps'),
            'childSeat'         => $request->boolean('childSeat'),
            'wifi'              => $request->boolean('wifi'),
            'insuranceCoverage' => $request->boolean('insuranceCoverage'),
        ]);

        // -------- Validate --------
        $request->validate([
            'category'           => ['required', Rule::in(['land','air','sea'])],
            'vehicleType'        => ['nullable','string','max:100'],
            'model'              => ['nullable','string','max:255'],
            'manufacture'        => ['nullable','string','max:255'],
            'manufactureYear'    => ['nullable','integer','min:1900','max:2100'],
            'registerYear'       => ['nullable','integer','min:1900','max:2100'],
            'number'             => ['nullable','string','max:255', Rule::unique('vehicles', 'registration_number')],
            'colour'             => ['nullable','string','max:64'],
            'description'        => ['nullable','string'],
            'passengerCapacity'  => ['nullable','integer','min:0','max:65535'],
            'mileage'            => ['nullable','integer','min:0'],

            // land
            'bodyType'           => ['nullable','string','max:50'],
            'fuelType'           => ['nullable','string','max:50'],
            'transmissionType'   => ['nullable','string','max:50'],
            'gears'              => ['nullable','integer','min:0'],
            'seats'              => ['nullable','integer','min:0','max:255'],
            'doors'              => ['nullable','integer','min:0','max:255'],
            'fuelTankCapacity'   => ['nullable','numeric','min:0'],

            // air
            'aircraft_type'          => ['nullable', Rule::in(['fixed_wing','helicopter','glider','other'])],
            'icao_type_designator'   => ['nullable','string','max:8'],
            'base_airport_iata'      => ['nullable','string','max:3'],
            'base_airport_icao'      => ['nullable','string','max:4'],
            'crew_required'          => ['nullable','integer','min:0','max:255'],
            'range_km'               => ['nullable','integer','min:0'],
            'mtow_kg'                => ['nullable','integer','min:0'],
            'cruising_speed_kts'     => ['nullable','integer','min:0'],
            'air_fuel_type'          => ['nullable', Rule::in(['jet_a1','avgas','electric','other'])],
            'flight_hours_total'     => ['nullable','integer','min:0'],

            // sea
            'vessel_type'        => ['nullable', Rule::in(['boat','yacht','catamaran','ferry','other'])],
            'hull_material'      => ['nullable','string','max:64'],
            'length_m'           => ['nullable','numeric','min:0'],
            'beam_m'             => ['nullable','numeric','min:0'],
            'draft_m'            => ['nullable','numeric','min:0'],
            'engine_type'        => ['nullable', Rule::in(['inboard','outboard','sail','hybrid','electric','other'])],
            'engine_power_hp'    => ['nullable','integer','min:0'],
            'sea_fuel_type'      => ['nullable', Rule::in(['diesel','petrol','electric','other'])],
            'cabins'             => ['nullable','integer','min:0','max:255'],
            'berths'             => ['nullable','integer','min:0','max:255'],
            'toilets'            => ['nullable','integer','min:0','max:255'],
            'fuel_tank_l'        => ['nullable','numeric','min:0'],
            'water_tank_l'       => ['nullable','numeric','min:0'],

            // pricing
            'rentalPricePerDay'  => ['nullable','numeric','min:0'],
            'totalRentalPrice'   => ['nullable','numeric','min:0'],
            'deposit'            => ['nullable','numeric','min:0'],
            'advancePayment'     => ['nullable','numeric','min:0'],

            // features
            'gps'                => ['nullable','boolean'],
            'childSeat'          => ['nullable','boolean'],
            'wifi'               => ['nullable','boolean'],
            'insuranceCoverage'  => ['nullable','boolean'],
            'extra'              => ['nullable','string'],

            // insurance quick
            'insuranceProvider'  => ['nullable','string','max:255'],

            // uploads
            'images.*'           => ['nullable','file','mimes:jpg,jpeg,png,webp,gif','max:10240'],
            'insuranceDocs.*'    => ['nullable','file','mimes:pdf,doc,docx,png,jpg,jpeg','max:10240'],
        ]);

        try {
            $vehicle = DB::transaction(function () use ($request, $type, $condition, $ownership) {
                // 1) Optional category record by name
                $categoryId = null;
                $vehicleTypeName = trim((string) $request->input('vehicleType',''));
                if ($vehicleTypeName !== '') {
                    $cat = VehicleCategory::firstOrCreate(
                        ['type' => $type, 'name' => $vehicleTypeName],
                        ['type' => $type, 'name' => $vehicleTypeName]
                    );
                    $categoryId = $cat->id;
                }

                // 2) Vehicle
                $vehicle = new Vehicle();
                $vehicle->provider_id            = auth()->id();
                $vehicle->type                   = $type;
                $vehicle->category_id            = $categoryId;

                $vehicle->model                  = $request->input('model');
                $vehicle->manufacturer           = $request->input('manufacture');
                $vehicle->manufacture_year       = $request->integer('manufactureYear') ?: null;
                $vehicle->registration_year      = $request->integer('registerYear') ?: null;
                $vehicle->registration_number    = $request->input('number');
                $vehicle->colour                 = $request->input('colour');

                $vehicle->condition              = $condition;
                $vehicle->ownership_type         = $ownership;

                $passengerCapacity = $request->integer('passengerCapacity');
                if ($passengerCapacity === null && $type === 'land') {
                    $passengerCapacity = $request->integer('seats') ?: null;
                }
                $vehicle->passenger_capacity     = $passengerCapacity;

                $vehicle->mileage_km             = $request->integer('mileage') ?: null;

                $vehicle->rental_price_per_day   = $request->input('rentalPricePerDay');
                $vehicle->total_rental_price     = $request->input('totalRentalPrice');
                $vehicle->deposit_amount         = $request->input('deposit');
                $vehicle->advance_payment_amount = $request->input('advancePayment');

                $vehicle->insurance_provider     = $request->input('insuranceProvider');

                $vehicle->gps                    = $request->boolean('gps');
                $vehicle->child_seat             = $request->boolean('childSeat');
                $vehicle->wifi                   = $request->boolean('wifi');
                $vehicle->insurance_coverage     = $request->boolean('insuranceCoverage');

                $vehicle->extra                  = $request->input('extra');

                // new units start as pending & inactive
                $vehicle->status                 = 'inactive';
                $vehicle->approval_status        = 'pending';

                $vehicle->description            = $request->input('description');

                $vehicle->save();

                // 3) Type-specific specs
                if ($type === 'air') {
                    AirVehicleSpec::updateOrCreate(
                        ['vehicle_id' => $vehicle->id],
                        [
                            'aircraft_type'        => $request->input('aircraft_type'),
                            'icao_type_designator' => $request->input('icao_type_designator'),
                            'base_airport_iata'    => $request->input('base_airport_iata'),
                            'base_airport_icao'    => $request->input('base_airport_icao'),
                            'seats'                => $request->integer('seats') ?: null,
                            'crew_required'        => $request->integer('crew_required') ?: null,
                            'range_km'             => $request->integer('range_km') ?: null,
                            'mtow_kg'              => $request->integer('mtow_kg') ?: null,
                            'cruising_speed_kts'   => $request->integer('cruising_speed_kts') ?: null,
                            'fuel_type'            => $request->input('air_fuel_type'),
                            'flight_hours_total'   => $request->integer('flight_hours_total') ?: null,
                        ]
                    );
                } elseif ($type === 'sea') {
                    SeaVehicleSpec::updateOrCreate(
                        ['vehicle_id' => $vehicle->id],
                        [
                            'vessel_type'      => $request->input('vessel_type'),
                            'hull_material'    => $request->input('hull_material'),
                            'length_m'         => $request->input('length_m'),
                            'beam_m'           => $request->input('beam_m'),
                            'draft_m'          => $request->input('draft_m'),
                            'engine_type'      => $request->input('engine_type'),
                            'engine_power_hp'  => $request->integer('engine_power_hp') ?: null,
                            'fuel_type'        => $request->input('sea_fuel_type'),
                            'cabins'           => $request->integer('cabins') ?: null,
                            'berths'           => $request->integer('berths') ?: null,
                            'toilets'          => $request->integer('toilets') ?: null,
                            'fuel_tank_l'      => $request->input('fuel_tank_l'),
                            'water_tank_l'     => $request->input('water_tank_l'),
                        ]
                    );
                } elseif ($type === 'land') {
                    LandVehicleSpec::updateOrCreate(
                        ['vehicle_id' => $vehicle->id],
                        [
                            'body_type'            => $request->input('bodyType'),
                            'fuel_type'            => $request->input('fuelType'),
                            'transmission_type'    => $request->input('transmissionType'),
                            'gears'                => $request->integer('gears') ?: null,
                            'seats'                => $request->integer('seats') ?: null,
                            'doors'                => $request->integer('doors') ?: null,
                            'fuel_tank_capacity_l' => $request->input('fuelTankCapacity'),
                        ]
                    );
                }

                // 4) Images
                if ($request->hasFile('images')) {
                    foreach ($request->file('images') as $i => $file) {
                        if (!$file) continue;
                        $path = $file->store("public/vehicles/{$vehicle->id}/images");
                        VehicleMedia::create([
                            'vehicle_id' => $vehicle->id,
                            'media_type' => 'image',
                            'title'      => $file->getClientOriginalName(),
                            'path'       => Storage::url($path),
                            'is_primary' => $i === 0,
                            'sort_order' => $i,
                        ]);
                    }
                }

                // 5) Insurance docs
                if ($request->hasFile('insuranceDocs')) {
                    foreach ($request->file('insuranceDocs') as $file) {
                        if (!$file) continue;
                        $path = $file->store("public/vehicles/{$vehicle->id}/documents");
                        VehicleDocument::create([
                            'vehicle_id'           => $vehicle->id,
                            'doc_type'             => 'insurance',
                            'provider_name'        => $request->input('insuranceProvider'),
                            'policy_or_doc_number' => null,
                            'issue_date'           => null,
                            'expiry_date'          => null,
                            'file_path'            => Storage::url($path),
                        ]);
                    }
                }

                return $vehicle;
            });

            return back()
                ->with('success', 'Unit saved successfully.')
                ->with('vehicle_id', $vehicle->id);

        } catch (\Illuminate\Database\QueryException $e) {
            return back()->withErrors([
                'server' => 'Database error: ' . $e->getMessage(),
            ])->withInput();
        } catch (\Throwable $e) {
            return back()->withErrors([
                'server' => 'Unexpected error: ' . $e->getMessage(),
            ])->withInput();
        }
    }

    /**
     * DELETE /vendor/vehicles/{vehicle}
     */
    public function destroy(Request $request, Vehicle $vehicle)
    {
        abort_unless($vehicle->provider_id === $request->user()->id, 403);

        DB::transaction(function () use ($vehicle) {
            VehicleMedia::where('vehicle_id', $vehicle->id)->delete();
            VehicleDocument::where('vehicle_id', $vehicle->id)->delete();
            LandVehicleSpec::where('vehicle_id', $vehicle->id)->delete();
            AirVehicleSpec::where('vehicle_id', $vehicle->id)->delete();
            SeaVehicleSpec::where('vehicle_id', $vehicle->id)->delete();
            $vehicle->delete();
        });

        return response()->json(['ok' => true]);
    }
}
