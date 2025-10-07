<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Warehouse\WarehouseUnit;
use App\Models\Warehouse\WarehouseApproval;

class WarehouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create some test users if they don't exist
        $user1 = User::firstOrCreate(
            ['email' => 'warehouse.owner1@example.com'],
            [
                'name' => 'John Warehouse Owner',
                'password' => bcrypt('password123'),
                'role' => 'vendor'
            ]
        );

        $user2 = User::firstOrCreate(
            ['email' => 'warehouse.owner2@example.com'],
            [
                'name' => 'Jane Storage Manager',
                'password' => bcrypt('password123'),
                'role' => 'vendor'
            ]
        );

        $user3 = User::firstOrCreate(
            ['email' => 'warehouse.owner3@example.com'],
            [
                'name' => 'Bob Logistics',
                'password' => bcrypt('password123'),
                'role' => 'vendor'
            ]
        );

        // Sample warehouse data
        $warehouses = [
            [
                'user_id' => $user1->id,
                'name' => 'North Industrial Warehouse',
                'description' => 'Large industrial warehouse suitable for manufacturing and storage operations.',
                'address' => '123 Industrial Park, New York, NY 10001',
                'latitude' => 40.7589,
                'longitude' => -73.9851,
                'total_area' => 25000.00,
                'capacity' => 20000.00,
                'capacity_unit' => 'sq_ft',
                'type' => 'industrial',
                'pricing_model' => 'monthly',
                'base_price' => 5000.00,
                'monthly_rate' => 5000.00,
                'security_deposit' => 10000.00,
                'setup_fee' => 500.00,
                'currency' => 'USD',
                'contact_person' => 'John Smith',
                'contact_phone' => '+1-555-0101',
                'contact_email' => 'john@northwarehouse.com',
                'is_active' => true,
                'is_available' => true,
            ],
            [
                'user_id' => $user2->id,
                'name' => 'South Cold Storage Facility',
                'description' => 'Temperature-controlled cold storage facility for perishable goods.',
                'address' => '456 Cold Storage Blvd, Miami, FL 33101',
                'latitude' => 25.7617,
                'longitude' => -80.1918,
                'total_area' => 15000.00,
                'capacity' => 12000.00,
                'capacity_unit' => 'sq_ft',
                'type' => 'cold_storage',
                'pricing_model' => 'monthly',
                'base_price' => 7500.00,
                'monthly_rate' => 7500.00,
                'security_deposit' => 15000.00,
                'setup_fee' => 1000.00,
                'currency' => 'USD',
                'contact_person' => 'Jane Doe',
                'contact_phone' => '+1-555-0102',
                'contact_email' => 'jane@southcold.com',
                'is_active' => false,
                'is_available' => false,
            ],
            [
                'user_id' => $user3->id,
                'name' => 'East Distribution Center',
                'description' => 'Multi-purpose distribution center with loading docks and office space.',
                'address' => '789 Distribution Way, Atlanta, GA 30309',
                'latitude' => 33.7490,
                'longitude' => -84.3880,
                'total_area' => 30000.00,
                'capacity' => 25000.00,
                'capacity_unit' => 'sq_ft',
                'type' => 'distribution',
                'pricing_model' => 'monthly',
                'base_price' => 8000.00,
                'monthly_rate' => 8000.00,
                'security_deposit' => 16000.00,
                'setup_fee' => 750.00,
                'currency' => 'USD',
                'contact_person' => 'Bob Johnson',
                'contact_phone' => '+1-555-0103',
                'contact_email' => 'bob@eastdist.com',
                'is_active' => true,
                'is_available' => true,
            ],
            [
                'user_id' => $user1->id,
                'name' => 'West Dry Storage Unit',
                'description' => 'Dry storage facility ideal for non-perishable goods and equipment.',
                'address' => '321 Storage Lane, Los Angeles, CA 90210',
                'latitude' => 34.0522,
                'longitude' => -118.2437,
                'total_area' => 18000.00,
                'capacity' => 15000.00,
                'capacity_unit' => 'sq_ft',
                'type' => 'dry_storage',
                'pricing_model' => 'monthly',
                'base_price' => 4500.00,
                'monthly_rate' => 4500.00,
                'security_deposit' => 9000.00,
                'setup_fee' => 300.00,
                'currency' => 'USD',
                'contact_person' => 'Alice Wilson',
                'contact_phone' => '+1-555-0104',
                'contact_email' => 'alice@westdry.com',
                'is_active' => true,
                'is_available' => false,
            ],
            [
                'user_id' => $user2->id,
                'name' => 'Central Bonded Warehouse',
                'description' => 'Secure bonded warehouse for imported goods and customs storage.',
                'address' => '654 Customs St, Chicago, IL 60601',
                'latitude' => 41.8781,
                'longitude' => -87.6298,
                'total_area' => 22000.00,
                'capacity' => 18000.00,
                'capacity_unit' => 'sq_ft',
                'type' => 'bonded',
                'pricing_model' => 'monthly',
                'base_price' => 6500.00,
                'monthly_rate' => 6500.00,
                'security_deposit' => 13000.00,
                'setup_fee' => 800.00,
                'currency' => 'USD',
                'contact_person' => 'Carlos Martinez',
                'contact_phone' => '+1-555-0105',
                'contact_email' => 'carlos@centralbonded.com',
                'is_active' => false,
                'is_available' => false,
            ],
        ];

        foreach ($warehouses as $warehouseData) {
            $warehouse = WarehouseUnit::create($warehouseData);
            
            // Create approval records with different statuses
            $statuses = ['pending', 'approved', 'rejected', 'suspended'];
            $status = $statuses[array_rand($statuses)];
            
            WarehouseApproval::create([
                'warehouse_unit_id' => $warehouse->id,
                'status' => $status,
                'notes' => "Initial status set to {$status}",
                'reviewed_at' => now(),
            ]);
        }

        $this->command->info('Warehouse test data seeded successfully!');
    }
}
