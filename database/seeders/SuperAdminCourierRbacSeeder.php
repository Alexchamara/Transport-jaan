<?php

namespace Database\Seeders;

use App\Support\SuperAdminCourierRbac;
use Illuminate\Database\Seeder;

class SuperAdminCourierRbacSeeder extends Seeder
{
    public function run(): void
    {
        SuperAdminCourierRbac::ensureDefinitionsExist();
    }
}
