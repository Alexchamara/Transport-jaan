<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Driver;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class DriverSeeder extends Seeder
{
    public function run(): void
    {
        // Sample drivers with various statuses and vehicle types
        $drivers = [
            [
                'full_name' => 'Kamal Perera',
                'phone' => '+94 77 123 4567',
                'email' => 'kamal.perera@example.com',
                'license_no' => 'B1234567',
                'license_expiry' => '2026-12-31',
                'vehicle_type' => 'Van',
                'vehicle_no' => 'WP CAA-1234',
                'status' => 'Active',
                'address' => '123 Galle Road, Colombo 03',
                'notes' => 'Experienced driver with 10+ years. Specializes in city deliveries.',
            ],
            [
                'full_name' => 'Nimal Silva',
                'phone' => '+94 71 234 5678',
                'email' => 'nimal.silva@example.com',
                'license_no' => 'B2345678',
                'license_expiry' => '2025-06-30',
                'vehicle_type' => 'Truck',
                'vehicle_no' => 'WP ABC-5678',
                'status' => 'Active',
                'address' => '456 Kandy Road, Kaduwela',
                'notes' => 'Heavy vehicle license holder. Good for long-distance transport.',
            ],
            [
                'full_name' => 'Saman Fernando',
                'phone' => '+94 76 345 6789',
                'email' => 'saman.fernando@example.com',
                'license_no' => 'B3456789',
                'license_expiry' => '2027-03-15',
                'vehicle_type' => 'Car',
                'vehicle_no' => 'CP XYZ-9012',
                'status' => 'Active',
                'address' => '789 Main Street, Negombo',
                'notes' => 'Available for light cargo and passenger transport.',
            ],
            [
                'full_name' => 'Ruwan Jayasinghe',
                'phone' => '+94 70 456 7890',
                'email' => 'ruwan.j@example.com',
                'license_no' => 'B4567890',
                'license_expiry' => '2026-09-20',
                'vehicle_type' => 'Bike',
                'vehicle_no' => 'WP DEF-3456',
                'status' => 'Active',
                'address' => '321 Temple Road, Kelaniya',
                'notes' => 'Fast delivery specialist for small packages.',
            ],
            [
                'full_name' => 'Chaminda Wijesinghe',
                'phone' => '+94 75 567 8901',
                'email' => 'chaminda.w@example.com',
                'license_no' => 'B5678901',
                'license_expiry' => '2025-11-30',
                'vehicle_type' => 'Van',
                'vehicle_no' => 'SG GHI-7890',
                'status' => 'Inactive',
                'address' => '654 Lake Road, Kurunegala',
                'notes' => 'Currently on leave. Will return next month.',
            ],
            [
                'full_name' => 'Pradeep Mendis',
                'phone' => '+94 72 678 9012',
                'email' => 'pradeep.mendis@example.com',
                'license_no' => 'B6789012',
                'license_expiry' => '2026-04-10',
                'vehicle_type' => 'Truck',
                'vehicle_no' => 'NC JKL-2345',
                'status' => 'Active',
                'address' => '987 Station Road, Gampaha',
                'notes' => 'Handles refrigerated transport. Available 24/7.',
            ],
            [
                'full_name' => 'Lasith Bandara',
                'phone' => '+94 78 789 0123',
                'email' => 'lasith.bandara@example.com',
                'license_no' => 'B7890123',
                'license_expiry' => '2027-08-25',
                'vehicle_type' => 'Car',
                'vehicle_no' => 'WP MNO-6789',
                'status' => 'Active',
                'address' => '147 Beach Road, Mount Lavinia',
                'notes' => 'Good for express deliveries and urgent shipments.',
            ],
            [
                'full_name' => 'Dinesh Rathnayake',
                'phone' => '+94 74 890 1234',
                'email' => null, // Some drivers may not have email
                'license_no' => 'B8901234',
                'license_expiry' => '2026-01-15',
                'vehicle_type' => 'Van',
                'vehicle_no' => 'WP PQR-0123',
                'status' => 'Active',
                'address' => '258 High Level Road, Maharagama',
                'notes' => 'Reliable and punctual. Prefers local deliveries.',
            ],
            [
                'full_name' => 'Asanka Kumara',
                'phone' => '+94 73 901 2345',
                'email' => 'asanka.k@example.com',
                'license_no' => 'B9012345',
                'license_expiry' => '2025-12-31',
                'vehicle_type' => 'Bike',
                'vehicle_no' => 'WP STU-4567',
                'status' => 'Inactive',
                'address' => '369 Old Road, Piliyandala',
                'notes' => 'Vehicle under maintenance. Expected back in service next week.',
            ],
            [
                'full_name' => 'Tharaka Rodrigo',
                'phone' => '+94 77 012 3456',
                'email' => 'tharaka.rodrigo@example.com',
                'license_no' => 'B0123456',
                'license_expiry' => '2027-05-20',
                'vehicle_type' => 'Truck',
                'vehicle_no' => 'EP VWX-8901',
                'status' => 'Active',
                'address' => '741 Horana Road, Panadura',
                'notes' => 'Interstate transport expert. Handles fragile cargo with care.',
            ],
        ];

        foreach ($drivers as $driverData) {
            Driver::firstOrCreate(
                ['license_no' => $driverData['license_no']], // Unique identifier
                $driverData
            );
        }

        $this->command->info('✅ ' . count($drivers) . ' drivers seeded successfully!');
        $this->command->info('Note: License and NIC photos should be uploaded through the application.');
    }
}
