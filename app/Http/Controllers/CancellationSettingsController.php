<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\CancellationSetting;

class CancellationSettingsController extends Controller
{
    /**
     * Display the cancellation settings form.
     */
    public function edit()
    {
        $settings = CancellationSetting::getAllSettings();
        
        return Inertia::render('Web/home/SuperAdmin/CancellationSettings', [
            'settings' => [
                'warehouse' => $settings['warehouse'] ?? 0,
                'vehicle' => $settings['vehicle'] ?? 0,
            ]
        ]);
    }

    /**
     * Update the cancellation settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'warehouse_days' => 'required|integer|min:0|max:365',
            'vehicle_days' => 'required|integer|min:0|max:365',
        ]);

        // Update or create settings
        CancellationSetting::setDaysForContext('warehouse', $validated['warehouse_days']);
        CancellationSetting::setDaysForContext('vehicle', $validated['vehicle_days']);

        return redirect()->back()->with('success', 'Cancellation settings updated successfully!');
    }
}
