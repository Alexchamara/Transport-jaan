<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('land_vehicle_specs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->cascadeOnDelete()
                ->unique();

            // Land-specific fields
            $table->string('body_type', 64)->nullable();          // e.g., Sedan, SUV, Truck
            $table->string('fuel_type', 32)->nullable();          // e.g., Petrol, Diesel, Electric
            $table->string('transmission_type', 32)->nullable();  // e.g., Manual, Automatic
            $table->unsignedTinyInteger('gears')->nullable();
            $table->unsignedTinyInteger('seats')->nullable();
            $table->unsignedTinyInteger('doors')->nullable();
            $table->decimal('fuel_tank_capacity_l', 8, 2)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('land_vehicle_specs');
    }
};
