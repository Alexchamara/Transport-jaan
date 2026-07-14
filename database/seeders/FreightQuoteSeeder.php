<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FreightQuote;

class FreightQuoteSeeder extends Seeder
{
    public function run(): void
    {
        $quotes = [
            [
                'origin' => 'Colombo, Sri Lanka',
                'destination' => 'Singapore',
                'load_type' => 'Container',
                'goods_description' => 'Electronics and computer parts',
                'length_cm' => 1200.00,
                'width_cm' => 240.00,
                'height_cm' => 260.00,
                'total_weight_kg' => 15000.00,
                'preferred_method' => 'Sea',
                'shipping_date' => now()->addDays(30),
                'notes' => 'Fragile items, handle with care. Temperature controlled required.',
                'status' => 'pending',
            ],
            [
                'origin' => 'Colombo, Sri Lanka',
                'destination' => 'Dubai, UAE',
                'load_type' => 'Pallets',
                'goods_description' => 'Textile and garment products',
                'length_cm' => 120.00,
                'width_cm' => 80.00,
                'height_cm' => 150.00,
                'total_weight_kg' => 2500.00,
                'preferred_method' => 'Air',
                'shipping_date' => now()->addDays(15),
                'notes' => 'Urgent delivery required. 10 pallets total.',
                'status' => 'pending',
            ],
        ];

        foreach ($quotes as $quote) {
            FreightQuote::create($quote);
        }
    }
}
