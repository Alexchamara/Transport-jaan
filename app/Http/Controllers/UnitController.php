<?php

// app/Http/Controllers/Vendor/UnitController.php
namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnitController extends Controller
{
    public function index(Request $request)
    {
        $filters = [
            'search'   => $request->string('search')->toString(),
            'status'   => $request->string('status')->toString(),
            'car_type' => $request->string('car_type')->toString(),
        ];

        $perPage = (int) $request->input('per_page', 10);

        $units = Unit::query()
            ->filter($filters)
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->appends($request->query());

        return Inertia::render('vendors/units/Unit', [
            'units'   => $units,      // Laravel paginator -> Inertia
            'filters' => $filters,
            'perPage' => $perPage,
            'perPageOptions' => [5,10,20,50],
        ]);
    }

    public function show(Unit $unit)
    {
        return Inertia::render('vendors/units/UnitDetails', [
            'unit' => $unit
        ]);
    }

    // stubs if you wire AddUnit modal to these:
    public function store(Request $request) { /* ... */ }
    public function update(Request $request, Unit $unit) { /* ... */ }
    public function destroy(Unit $unit) { $unit->delete(); return back(); }
}
