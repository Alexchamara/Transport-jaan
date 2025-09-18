<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Allow if logged in; tighten if you have roles:
        // return auth()->check() && auth()->user()->hasRole('vendor');
        return auth()->check();
    }

    /**
     * Normalize incoming fields before validation.
     */
    protected function prepareForValidation(): void
    {
        // category -> land|air|sea
        $rawType = (string) $this->input('category', '');
        $type = strtolower($rawType);
        if (!in_array($type, ['land','air','sea'], true)) {
            $map = ['Land' => 'land', 'Air' => 'air', 'Sea' => 'sea'];
            $type = $map[$rawType] ?? 'land';
        }

        // condition -> {new|used|refurbished}
        $conditionRaw = strtolower((string) $this->input('condition', ''));
        $condition = match ($conditionRaw) {
            'new' => 'new',
            'refurbished' => 'refurbished',
            'excellent','good','fair','needs repair','needs_repair' => 'used',
            default => $conditionRaw ?: null,
        };

        // ownership -> {company_owned|partner_owned|leased}
        $ownershipRaw = strtolower((string) $this->input('ownershipType', ''));
        $ownership = match ($ownershipRaw) {
            'owned'     => 'company_owned',
            'leased'    => 'leased',
            'rented'    => 'partner_owned',
            'financed'  => 'partner_owned',
            default     => null,
        };

        // registration number: uppercase, strip spaces/dashes
        $regNormalized = strtoupper(preg_replace('/[\s\-]+/', '', trim((string) $this->input('number', '')))) ?: null;

        $this->merge([
            'category'          => $type,
            'condition'         => $condition,
            'ownershipType'     => $ownership,
            'number'            => $regNormalized,
            // ensure true booleans
            'gps'               => $this->boolean('gps'),
            'childSeat'         => $this->boolean('childSeat'),
            'wifi'              => $this->boolean('wifi'),
            'insuranceCoverage' => $this->boolean('insuranceCoverage'),
        ]);
    }

    public function rules(): array
    {
        return [
            // core
            'category'           => ['required', Rule::in(['land','air','sea'])],
            'vehicleType'        => ['nullable','string','max:100'],
            'model'              => ['nullable','string','max:255'],
            'manufacture'        => ['nullable','string','max:255'],
            'manufactureYear'    => ['nullable','integer','min:1900','max:2100'],
            'registerYear'       => ['nullable','integer','min:1900','max:2100'],

            // prevent duplicate registration numbers
            'number'             => ['nullable','string','max:255', Rule::unique('vehicles', 'registration_number')],

            'colour'             => ['nullable','string','max:64'],
            'description'        => ['nullable','string'],

            // generic specs
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
        ];
    }
}
