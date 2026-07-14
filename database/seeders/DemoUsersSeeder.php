<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class DemoUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Super Admin User
        User::firstOrCreate(
            ['email' => 'superadmin@gmail.com'],
            [
                'name' => 'superadmin',
                'email' => 'superadmin@gmail.com',
                'password' => Hash::make('Super1122'),
                'role' => 'SuperAdmin',
                'status' => 'verified',
            ]
        );
        User::firstOrCreate(
            ['email' => 'client@gmail.com'],
            [
                'name' => 'client',
                'email' => 'client@gmail.com',
                'password' => Hash::make('Client@1122'),
                'role' => 'client',
                'status' => 'verified',
            ]
        );

        // Minimal demo accounts (adjust to your auth schema / roles as needed)
        User::firstOrCreate(
            ['email' => 'admin@demo.test'],
            [
                'name' => 'Admin User',
                'email' => 'admin@demo.test',
                'password' => Hash::make('password'),
                'status' => 'verified',
            ]
        );

        foreach (range(1, 5) as $i) {
            User::firstOrCreate(
                ['email' => "provider{$i}@demo.test"],
                [
                    'name' => "Provider {$i}",
                    'password' => Hash::make('password'),
                ]
            );
        }

        foreach (['driver','pilot','captain'] as $role) {
            User::firstOrCreate(
                ['email' => "{$role}@demo.test"],
                [
                    'name' => ucfirst($role),
                    'password' => Hash::make('password'),
                ]
            );
        }
              // Vendor user
        User::firstOrCreate(
            ['email' => 'vendor@example.com'],
            [
                'name' => 'Vendor User',
                'password' => Hash::make('12345678'),
                'role' => 'vendor',
                'status' => 'verified',
                'phone' => '9876543210',
                'address' => 'Kandy, Sri Lanka',
                'country' => 'Sri Lanka',
            ]
        );
    }
}

