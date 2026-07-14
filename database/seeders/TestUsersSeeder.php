<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Create test client users
        User::firstOrCreate(
            ['email' => 'client1@example.com'],
            [
                'name' => 'John Smith',
                'email' => 'client1@example.com',
                'password' => Hash::make('password'),
                'role' => 'client',
                'status' => 'verified',
                'phone' => '+1-555-111-2222',
                'address' => '123 Main St, New York',
                'country' => 'USA',
                'date_of_birth' => '1990-05-15',
            ]
        );

        User::firstOrCreate(
            ['email' => 'client2@example.com'],
            [
                'name' => 'Sarah Johnson',
                'email' => 'client2@example.com',
                'password' => Hash::make('password'),
                'role' => 'client',
                'status' => 'unverified',
                'phone' => '+1-555-333-4444',
                'address' => '456 Oak Ave, California',
                'country' => 'USA',
                'date_of_birth' => '1985-08-22',
            ]
        );

        User::firstOrCreate(
            ['email' => 'client3@example.com'],
            [
                'name' => 'Michael Brown',
                'email' => 'client3@example.com',
                'password' => Hash::make('password'),
                'role' => 'client',
                'status' => 'blocked',
                'phone' => '+1-555-555-6666',
                'address' => '789 Pine St, Texas',
                'country' => 'USA',
                'date_of_birth' => '1992-12-03',
            ]
        );

        User::firstOrCreate(
            ['email' => 'client4@example.com'],
            [
                'name' => 'Emily Davis',
                'email' => 'client4@example.com',
                'password' => Hash::make('password'),
                'role' => 'client',
                'status' => 'verified',
                'phone' => '+1-555-777-8888',
                'address' => '321 Elm Dr, Florida',
                'country' => 'USA',
                'date_of_birth' => '1988-03-18',
            ]
        );

        User::firstOrCreate(
            ['email' => 'client5@example.com'],
            [
                'name' => 'David Wilson',
                'email' => 'client5@example.com',
                'password' => Hash::make('password'),
                'role' => 'client',
                'status' => 'rejected',
                'phone' => '+1-555-999-0000',
                'address' => '654 Maple Ln, Washington',
                'country' => 'USA',
                'date_of_birth' => '1995-07-09',
            ]
        );

        // Additional vendors if they don't exist from VendorUsersSeeder
        User::firstOrCreate(
            ['email' => 'vendor1@example.com'],
            [
                'name' => 'Transport Co Inc',
                'email' => 'vendor1@example.com',
                'password' => Hash::make('password'),
                'role' => 'vendor',
                'status' => 'verified',
                'phone' => '+1-555-123-9999',
                'address' => '100 Business Park, New York',
                'country' => 'USA',
            ]
        );

        User::firstOrCreate(
            ['email' => 'vendor2@example.com'],
            [
                'name' => 'Quick Delivery LLC',
                'email' => 'vendor2@example.com',
                'password' => Hash::make('password'),
                'role' => 'vendor',
                'status' => 'unverified',
                'phone' => '+1-555-456-7890',
                'address' => '200 Industrial Ave, California',
                'country' => 'USA',
            ]
        );

        echo "Test users created successfully!\n";
    }
}
