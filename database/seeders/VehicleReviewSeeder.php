<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\VehicleReview;
use App\Models\User;

class VehicleReviewSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = Vehicle::limit(2)->get();
        $clients = User::where('role', 'client')->limit(2)->get();

        if ($vehicles->isEmpty() || $clients->isEmpty()) {
            return;
        }

        foreach ($vehicles as $index => $vehicle) {
            if (isset($clients[$index])) {
                VehicleReview::create([
                    'vehicle_id' => $vehicle->id,
                    'client_id' => $clients[$index]->id,
                    'rating' => $index === 0 ? 5 : 4,
                    'comment' => $index === 0
                        ? 'Excellent vehicle! Very comfortable and clean. The driver was professional and punctual.'
                        : 'Great experience overall. The vehicle was in good condition and met all our needs.',
                ]);
            }
        }
    }
}
