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
    public function index(Request $request)
    {
        $query = WarehouseUnit::where('user_id', Auth::id());

        // Add search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
        }

        // Add status filter
        if ($request->filled('status')) {
            $status = $request->get('status');
            if ($status === 'Available') {
                $query->where('is_active', true)
                      ->where('approval_status', 'approved');
            } elseif ($status === 'Occupied') {
                // You might need to add booking logic here
                $query->where('is_active', true)
                      ->where('approval_status', 'approved');
            } elseif ($status === 'Pending') {
                $query->where('approval_status', 'pending');
            } elseif ($status === 'Inactive') {
                $query->where('is_active', false);
            }
        }

        // Add type filter
        if ($request->filled('type')) {
            $query->where('type', $request->get('type'));
        }

        // Order by latest first
        $query->orderBy('created_at', 'desc');

        // Paginate results
        $perPage = $request->get('per_page', 10);
        $units = $query->paginate($perPage);

        // Transform the data to match frontend expectations
        $units->getCollection()->transform(function ($unit) {
            // Convert image paths to full URLs
            $imageUrls = [];
            if ($unit->images) {
                foreach ($unit->images as $imagePath) {
                    $imageUrls[] = Storage::url($imagePath);
                }
            }

            // Convert document paths to full URLs
            $documentUrls = [];
            if ($unit->documents) {
                foreach ($unit->documents as $documentPath) {
                    $documentUrls[] = Storage::url($documentPath);
                }
            }

            return [
                'id' => $unit->id,
                'name' => $unit->name,
                'address' => $unit->address,
                'latitude' => $unit->latitude,
                'longitude' => $unit->longitude,
                'total_area' => $unit->total_area,
                'capacity' => $unit->capacity,
                'type' => $unit->type,
                'amenities' => $unit->amenities ?? [],
                'pricing_model' => $unit->pricing_model,
                'price' => $unit->price,
                'status' => $this->getUnitStatus($unit),
                'is_active' => $unit->is_active,
                'availability_status' => $this->getAvailabilityStatus($unit),
                'approval_status' => $unit->approval_status,
                'images' => $imageUrls,
                'documents' => $documentUrls,
                'created_at' => $unit->created_at,
                'updated_at' => $unit->updated_at,
            ];
        });

        return response()->json($units);
    }

    private function getUnitStatus($unit)
    {
        if (!$unit->is_active) {
            return 'Inactive';
        }
        
        if ($unit->approval_status === 'pending') {
            return 'Pending Approval';
        }
        
        if ($unit->approval_status === 'rejected') {
            return 'Rejected';
        }
        
        // For now, we'll assume all approved units are available
        // You can extend this logic based on booking system
        return 'Available';
    }

    private function getAvailabilityStatus($unit)
    {
        if (!$unit->is_active) {
            return 'Inactive';
        }
        
        if ($unit->approval_status === 'pending') {
            return 'Pending Approval';
        }
        
        if ($unit->approval_status === 'rejected') {
            return 'Rejected';
        }
        
        if ($unit->approval_status === 'approved') {
            // You can add booking logic here to check if unit is occupied
            return 'Available';
        }
        
        return 'Unavailable';
    }

    public function store(Request $request)
    {
        // Check if the request size is too large
        if ($request->hasFile('images') && count($request->file('images')) > 20) {
            return back()->withErrors(['images' => 'You can upload a maximum of 20 images.'])->withInput();
        }

        try {
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
                'images.*' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:51200'], // 50MB per image
                'documents.*' => ['nullable', 'file', 'mimes:pdf,doc,docx,txt', 'max:51200'], // 50MB per document
                'terms_conditions' => ['nullable', 'string'],
                'terms_pdf' => ['nullable', 'file', 'mimes:pdf', 'max:51200'], // 50MB
                'is_active' => ['nullable', Rule::in(['0','1'])],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Check if it's a POST size limit error
            if (empty($_POST) && empty($_FILES) && $_SERVER['CONTENT_LENGTH'] > 0) {
                return back()->withErrors(['error' => 'The uploaded files are too large. Please reduce the file sizes or upload fewer files.'])->withInput();
            }
            throw $e;
        }

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

    public function show($id)
    {
        $unit = WarehouseUnit::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$unit) {
            return response()->json(['error' => 'Warehouse unit not found'], 404);
        }

        // Convert image paths to full URLs
        $imageUrls = [];
        if ($unit->images) {
            foreach ($unit->images as $imagePath) {
                $imageUrls[] = Storage::url($imagePath);
            }
        }

        // Convert document paths to full URLs
        $documentUrls = [];
        if ($unit->documents) {
            foreach ($unit->documents as $documentPath) {
                $documentUrls[] = Storage::url($documentPath);
            }
        }

        // Convert terms PDF path to full URL
        $termsPdfUrl = $unit->terms_pdf_path ? Storage::url($unit->terms_pdf_path) : null;

        return response()->json([
            'id' => $unit->id,
            'name' => $unit->name,
            'address' => $unit->address,
            'latitude' => $unit->latitude,
            'longitude' => $unit->longitude,
            'total_area' => $unit->total_area,
            'capacity' => $unit->capacity,
            'type' => $unit->type,
            'amenities' => $unit->amenities ?? [],
            'pricing_model' => $unit->pricing_model,
            'price' => $unit->price,
            'images' => $imageUrls,
            'documents' => $documentUrls,
            'terms_conditions' => $unit->terms_conditions,
            'terms_pdf_path' => $termsPdfUrl,
            'is_active' => $unit->is_active,
            'approval_status' => $unit->approval_status,
            'approved_at' => $unit->approved_at,
            'approved_by' => $unit->approved_by,
            'rejection_reason' => $unit->rejection_reason,
            'status' => $this->getUnitStatus($unit),
            'availability_status' => $this->getAvailabilityStatus($unit),
            'created_at' => $unit->created_at,
            'updated_at' => $unit->updated_at,
        ]);
    }

    public function update(Request $request, $id)
    {
        $unit = WarehouseUnit::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$unit) {
            return response()->json(['error' => 'Warehouse unit not found'], 404);
        }

        // Check if the request size is too large
        if ($request->hasFile('images') && count($request->file('images')) > 20) {
            return back()->withErrors(['images' => 'You can upload a maximum of 20 images.'])->withInput();
        }

        try {
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
                'images.*' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:10240'], // 10MB max per image
                'documents.*' => ['nullable', 'file', 'mimes:pdf,doc,docx,txt', 'max:10240'], // 10MB max per document
                'terms_conditions' => ['nullable', 'string'],
                'terms_pdf' => ['nullable', 'file', 'mimes:pdf', 'max:10240'], // 10MB max
                'is_active' => ['nullable', Rule::in(['0','1'])],
                'remove_images' => ['nullable', 'array'], // Array of image paths to remove
                'remove_documents' => ['nullable', 'array'], // Array of document paths to remove
                'remove_terms_pdf' => ['nullable', 'boolean'], // Flag to remove terms PDF
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Check if it's a POST size limit error
            if (empty($_POST) && empty($_FILES) && $_SERVER['CONTENT_LENGTH'] > 0) {
                return back()->withErrors(['file' => 'The uploaded files are too large. Please reduce file sizes and try again.'])->withInput();
            }
            throw $e;
        }

        // Parse amenities
        $amenities = $unit->amenities ?? [];
        if (!empty($validated['amenities'])) {
            $decoded = json_decode($validated['amenities'], true);
            if (is_array($decoded)) $amenities = $decoded;
        }

        // Handle image removals
        $currentImages = $unit->images ?? [];
        if (!empty($validated['remove_images'])) {
            foreach ($validated['remove_images'] as $imageToRemove) {
                // Remove from storage
                if (Storage::disk('public')->exists($imageToRemove)) {
                    Storage::disk('public')->delete($imageToRemove);
                }
                // Remove from array
                $currentImages = array_filter($currentImages, function($img) use ($imageToRemove) {
                    return $img !== $imageToRemove;
                });
            }
        }

        // Handle new images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $img) {
                $currentImages[] = $img->store('warehouse/images', 'public');
            }
        }

        // Handle document removals
        $currentDocuments = $unit->documents ?? [];
        if (!empty($validated['remove_documents'])) {
            foreach ($validated['remove_documents'] as $docToRemove) {
                // Remove from storage
                if (Storage::disk('public')->exists($docToRemove)) {
                    Storage::disk('public')->delete($docToRemove);
                }
                // Remove from array
                $currentDocuments = array_filter($currentDocuments, function($doc) use ($docToRemove) {
                    return $doc !== $docToRemove;
                });
            }
        }

        // Handle new documents
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $doc) {
                $currentDocuments[] = $doc->store('warehouse/documents', 'public');
            }
        }

        // Handle terms PDF
        $termsPdfPath = $unit->terms_pdf_path;
        if (!empty($validated['remove_terms_pdf']) && $validated['remove_terms_pdf']) {
            // Remove existing terms PDF
            if ($termsPdfPath && Storage::disk('public')->exists($termsPdfPath)) {
                Storage::disk('public')->delete($termsPdfPath);
            }
            $termsPdfPath = null;
        }

        if ($request->hasFile('terms_pdf')) {
            // Remove old terms PDF if exists
            if ($termsPdfPath && Storage::disk('public')->exists($termsPdfPath)) {
                Storage::disk('public')->delete($termsPdfPath);
            }
            $termsPdfPath = $request->file('terms_pdf')->store('warehouse/terms', 'public');
        }

        // Update the unit
        $unit->update([
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
            'images' => array_values($currentImages), // Re-index array
            'documents' => array_values($currentDocuments), // Re-index array
            'terms_conditions' => $validated['terms_conditions'] ?? null,
            'terms_pdf_path' => $termsPdfPath,
            'is_active' => ($validated['is_active'] ?? '1') === '1',
            // Reset approval status to pending when updated
            'approval_status' => 'pending',
            'approved_at' => null,
            'approved_by' => null,
            'rejection_reason' => null,
        ]);

        return back()->with('success', 'Warehouse unit updated successfully. It will be reviewed for approval.');
    }

    public function updateStatus(Request $request, $id)
    {
        $unit = WarehouseUnit::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$unit) {
            return response()->json(['error' => 'Warehouse unit not found'], 404);
        }

        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $unit->update([
            'is_active' => $validated['is_active']
        ]);

        return response()->json([
            'message' => 'Warehouse unit status updated successfully',
            'unit' => [
                'id' => $unit->id,
                'is_active' => $unit->is_active,
                'status' => $this->getUnitStatus($unit),
                'availability_status' => $this->getAvailabilityStatus($unit),
            ]
        ]);
    }

    // Admin approval methods
    public function approve(Request $request, $id)
    {
        $unit = WarehouseUnit::findOrFail($id);

        $unit->update([
            'approval_status' => 'approved',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'rejection_reason' => null,
            'is_active' => true, // Automatically activate when approved
        ]);

        return response()->json([
            'message' => 'Warehouse unit approved and activated successfully',
            'unit' => [
                'id' => $unit->id,
                'approval_status' => $unit->approval_status,
                'is_active' => $unit->is_active,
                'status' => $this->getUnitStatus($unit),
                'availability_status' => $this->getAvailabilityStatus($unit),
            ]
        ]);
    }

    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);

        $unit = WarehouseUnit::findOrFail($id);

        $unit->update([
            'approval_status' => 'rejected',
            'approved_at' => null,
            'approved_by' => null,
            'rejection_reason' => $validated['rejection_reason'],
            'is_active' => false, // Deactivate when rejected
        ]);

        return response()->json([
            'message' => 'Warehouse unit rejected successfully',
            'unit' => [
                'id' => $unit->id,
                'approval_status' => $unit->approval_status,
                'is_active' => $unit->is_active,
                'rejection_reason' => $unit->rejection_reason,
                'status' => $this->getUnitStatus($unit),
                'availability_status' => $this->getAvailabilityStatus($unit),
            ]
        ]);
    }

    public function destroy($id)
    {
        $unit = WarehouseUnit::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$unit) {
            return response()->json(['error' => 'Warehouse unit not found'], 404);
        }

        // Delete associated files
        if ($unit->images) {
            foreach ($unit->images as $imagePath) {
                if (Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }
        }

        if ($unit->documents) {
            foreach ($unit->documents as $documentPath) {
                if (Storage::disk('public')->exists($documentPath)) {
                    Storage::disk('public')->delete($documentPath);
                }
            }
        }

        if ($unit->terms_pdf_path && Storage::disk('public')->exists($unit->terms_pdf_path)) {
            Storage::disk('public')->delete($unit->terms_pdf_path);
        }

        $unit->delete();

        return response()->json(['message' => 'Warehouse unit deleted successfully']);
    }
}
