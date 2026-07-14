<?php

namespace Database\Seeders;

use App\Support\CourierRbac;
use Illuminate\Database\Seeder;

class CourierRbacSeeder extends Seeder
{
    public function run(): void
    {
        CourierRbac::ensureDefinitionsExist();
    }
}
