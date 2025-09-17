<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create or update Super Admin User
        User::updateOrCreate(
            ['email' => 'superadmin@gmail.com'],
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@gmail.com',
                'password' => Hash::make('Super1122'),
                'role' => 'SuperAdmin',
                'email_verified_at' => now(),
            ]
        );

        echo "SuperAdmin user created/updated successfully!\n";
        echo "Email: superadmin@gmail.com\n";
        echo "Password: Super1122\n";
        echo "Role: SuperAdmin\n";
    }
}
