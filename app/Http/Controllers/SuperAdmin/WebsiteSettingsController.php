<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\WebsiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class WebsiteSettingsController extends Controller
{
    /**
     * Show the website settings page
     */
    public function index()
    {
        return Inertia::render('Web/home/SuperAdmin/WebsiteSettings');
    }

    /**
     * Upload website logo
     */
    public function uploadLogo(Request $request)
    {
        try {
            $validated = $request->validate([
                'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
            ]);

            // Get or create website settings (ideally only one record)
            $settings = WebsiteSetting::firstOrCreate(['id' => 1]);

            // Delete old logo if exists
            if ($settings->logo && file_exists(public_path($settings->logo))) {
                unlink(public_path($settings->logo));
            }

            // Ensure uploads directory exists
            $uploadsDir = 'uploads/settings';
            if (!is_dir(public_path($uploadsDir))) {
                mkdir(public_path($uploadsDir), 0755, true);
            }

            // Store the file directly in public/uploads/settings
            $file = $request->file('logo');
            $filename = uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path($uploadsDir), $filename);

            // Store relative path from public directory
            $logoPath = "{$uploadsDir}/{$filename}";

            // Update the database record with the relative path
            $settings->update([
                'logo' => $logoPath,
            ]);

            // Return Inertia response for Inertia requests, JSON for others
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('success', 'Logo uploaded successfully');
            }

            // Return the URL to the stored file for non-Inertia requests
            $logoUrl = asset($logoPath);

            return response()->json([
                'success' => true,
                'message' => 'Logo uploaded successfully',
                'logo' => $logoUrl,
            ], 200);
        } catch (\Exception $e) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->withErrors(['logo' => $e->getMessage()]);
            }
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current logo
     */
    public function getCurrentLogo()
    {
        try {
            $settings = WebsiteSetting::find(1);

            if ($settings && $settings->logo) {
                $logoUrl = asset($settings->logo);
                return response()->json([
                    'success' => true,
                    'logo' => $logoUrl,
                ], 200);
            }

            return response()->json([
                'success' => true,
                'logo' => null,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Serve files from storage
     */
    public function serveFile($path)
    {
        $filePath = "public/{$path}";
        
        if (!Storage::exists($filePath)) {
            abort(404, 'File not found');
        }

        $file = Storage::path($filePath);
        
        return response()->file($file, [
            'Content-Disposition' => 'inline',
        ]);
    }
}
