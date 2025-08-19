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
        // Minimal demo accounts (adjust to your auth schema / roles as needed)
        User::firstOrCreate(
            ['email' => 'admin@demo.test'],
            [
                'name' => 'Admin User',
                'email' => 'admin@demo.test',
                'password' => Hash::make('password'),
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
    }
}
