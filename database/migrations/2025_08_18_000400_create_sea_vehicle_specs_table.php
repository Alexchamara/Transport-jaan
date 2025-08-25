<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sea_vehicle_specs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete()->unique();

            $table->enum('vessel_type', ['boat','yacht','catamaran','ferry','other'])->nullable();
            $table->string('hull_material', 64)->nullable();
            $table->decimal('length_m', 8, 2)->nullable();
            $table->decimal('beam_m', 8, 2)->nullable();
            $table->decimal('draft_m', 8, 2)->nullable();

            $table->enum('engine_type', ['inboard','outboard','sail','hybrid','electric','other'])->nullable();
            $table->unsignedInteger('engine_power_hp')->nullable();
            $table->enum('fuel_type', ['diesel','petrol','electric','other'])->nullable();

            $table->unsignedTinyInteger('cabins')->nullable();
            $table->unsignedTinyInteger('berths')->nullable();
            $table->unsignedTinyInteger('toilets')->nullable();
            $table->decimal('fuel_tank_l', 10, 2)->nullable();
            $table->decimal('water_tank_l', 10, 2)->nullable();

            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('sea_vehicle_specs');
    }
};
