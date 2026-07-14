<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\VehiclePolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VehiclePolicyController extends Controller
{
    // POST /vendor/vehicles/{vehicle}/policy
    public function store(Request $request, Vehicle $vehicle)
    {
        $this->authorizeOwner($request, $vehicle);

        // Accept common field names
        $key = null;
        foreach (['pdf','policy','file'] as $candidate) {
            if ($request->hasFile($candidate)) { $key = $candidate; break; }
        }
        if (!$key) {
            return response()->json([
                'message' => 'No file uploaded.',
                'errors'  => ['pdf' => ['The PDF file is required.']],
            ], 422);
        }

        // Version-proof validator
        $request->validate([
            $key => 'required|file|mimes:pdf|max:20480', // 20MB
        ]);

        $disk = 'public';
        $dir  = "vehicles/{$vehicle->id}/policies";

        try {
            // Remove existing policy files (handles duplicates too)
            $existing = VehiclePolicy::where('vehicle_id', $vehicle->id)->get();
            foreach ($existing as $ex) {
                $exDisk = $ex->disk ?: $disk;
                if ($ex->file_path && Storage::disk($exDisk)->exists($ex->file_path)) {
                    Storage::disk($exDisk)->delete($ex->file_path);
                }
            }

            $file = $request->file($key);
            $path = $file->store($dir, ['disk' => $disk]);

            // Upsert one row per vehicle
            $policy = VehiclePolicy::updateOrCreate(
                ['vehicle_id' => $vehicle->id],
                [
                    'file_path'     => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type'     => $file->getMimeType(),
                    'size'          => $file->getSize(),
                    'disk'          => $disk,
                ]
            );

            // Remove straggler rows if any
            VehiclePolicy::where('vehicle_id', $vehicle->id)
                ->where('id', '!=', $policy->id)
                ->delete();

            $streamUrl = route('vendor.vehicles.policy.stream', ['vehicle' => $vehicle->id]);

            return response()->json([
                'message'           => 'Uploaded',
                'policy_stream_url' => $streamUrl,
                'policy_pdf_url'    => $policy->url,
                'url'               => $policy->url,
            ], 201);

        } catch (\Throwable $e) {
            Log::error('Vehicle policy upload failed', [
                'vehicle_id' => $vehicle->id,
                'error'      => $e->getMessage(),
            ]);

            if (config('app.debug')) {
                return response()->json(['message' => $e->getMessage()], 500);
            }
            return response()->json(['message' => 'Server error while uploading policy PDF.'], 500);
        }
    }

    // DELETE /vendor/vehicles/{vehicle}/policy
    public function destroy(Request $request, Vehicle $vehicle)
    {
        $this->authorizeOwner($request, $vehicle);

        try {
            $policies = VehiclePolicy::where('vehicle_id', $vehicle->id)->get();
            foreach ($policies as $policy) {
                $disk = $policy->disk ?: 'public';
                if ($policy->file_path && Storage::disk($disk)->exists($policy->file_path)) {
                    Storage::disk($disk)->delete($policy->file_path);
                }
            }
            VehiclePolicy::where('vehicle_id', $vehicle->id)->delete();

            return response()->noContent();

        } catch (\Throwable $e) {
            Log::error('Vehicle policy delete failed', [
                'vehicle_id' => $vehicle->id,
                'error'      => $e->getMessage(),
            ]);
            if (config('app.debug')) {
                return response()->json(['message' => $e->getMessage()], 500);
            }
            return response()->json(['message' => 'Server error while deleting policy PDF.'], 500);
        }
    }

    // GET /vendor/vehicles/{vehicle}/policy/view
    public function stream(Request $request, Vehicle $vehicle): StreamedResponse
    {
        $this->authorizeOwner($request, $vehicle);

        $policy = VehiclePolicy::where('vehicle_id', $vehicle->id)->latest('id')->first();
        abort_unless($policy && $policy->file_path, 404);

        $disk = $policy->disk ?: 'public';
        $path = $policy->file_path;
        abort_unless(Storage::disk($disk)->exists($path), 404);

        return Storage::disk($disk)->response(
            $path,
            $policy->original_name ?? 'policy.pdf',
            [
                'Content-Type'           => 'application/pdf',
                'X-Content-Type-Options' => 'nosniff',
                'Content-Disposition'    => 'inline; filename="'.($policy->original_name ?? 'policy.pdf').'"',
            ]
        );
    }

    private function authorizeOwner(Request $request, Vehicle $vehicle): void
    {
        abort_unless($vehicle->provider_id === $request->user()->id, 403);
    }
}
