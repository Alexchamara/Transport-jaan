<?php

namespace App\Http\Controllers\WarehouseControllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Warehouse\WarehouseUnit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class WarehouseUnitController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'total_area' => ['nullable', 'numeric', 'min:0'],
            'capacity' => ['nullable', 'numeric', 'min:0'],
            'type' => ['required', 'string', 'max:255'],
            'pricing_model' => ['required', 'string', Rule::in([
                'per_sqft_monthly', 'per_sqft_daily', 'per_pallet_monthly',
                'per_pallet_daily', 'flat_rate_monthly', 'flat_rate_daily'
            ])],
            'price' => ['nullable', 'numeric', 'min:0'],
            'amenities' => ['nullable', 'string'], // JSON encoded
            'images.*' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif', 'max:10240'],
            'documents.*' => ['nullable', 'file', 'mimes:pdf,doc,docx,txt', 'max:10240'],
            'terms_conditions' => ['nullable', 'string'],
            'terms_pdf' => ['nullable', 'file', 'mimes:pdf', 'max:20480'],
            'is_active' => ['nullable', Rule::in(['0','1'])],
        ]);

        // parse amenities
        $amenities = [];
        if (!empty($validated['amenities'])) {
            $decoded = json_decode($validated['amenities'], true);
            if (is_array($decoded)) $amenities = $decoded;
        }

        // handle images
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $img) {
                $imagePaths[] = $img->store('warehouse/images', 'public');
            }
        }

        // handle documents
        $docPaths = [];
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $doc) {
                $docPaths[] = $doc->store('warehouse/documents', 'public');
            }
        }

        // terms pdf
        $termsPdfPath = null;
        if ($request->hasFile('terms_pdf')) {
            $termsPdfPath = $request->file('terms_pdf')->store('warehouse/terms', 'public');
        }

        $unit = WarehouseUnit::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'address' => $validated['address'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'total_area' => $validated['total_area'] ?? null,
            'capacity' => $validated['capacity'] ?? null,
            'type' => $validated['type'],
            'pricing_model' => $validated['pricing_model'],
            'price' => $validated['price'] ?? null,
            'amenities' => $amenities,
            'images' => $imagePaths,
            'documents' => $docPaths,
            'terms_conditions' => $validated['terms_conditions'] ?? null,
            'terms_pdf_path' => $termsPdfPath,
            'is_active' => ($validated['is_active'] ?? '1') === '1',
            'approval_status' => 'pending',
        ]);

        return back()->with('success', 'Warehouse unit created successfully.');
    }
}
