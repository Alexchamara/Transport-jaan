<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('air_vehicle_specs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete()->unique();

            $table->enum('aircraft_type', ['fixed_wing','helicopter','glider','other'])->nullable();
            $table->string('icao_type_designator', 8)->nullable()->index();
            $table->string('base_airport_iata', 3)->nullable()->index();
            $table->string('base_airport_icao', 4)->nullable()->index();

            $table->unsignedTinyInteger('seats')->nullable();
            $table->unsignedTinyInteger('crew_required')->nullable();
            $table->unsignedInteger('range_km')->nullable();
            $table->unsignedInteger('mtow_kg')->nullable();
            $table->unsignedInteger('cruising_speed_kts')->nullable();
            $table->enum('fuel_type', ['jet_a1','avgas','electric','other'])->nullable();

            $table->unsignedInteger('flight_hours_total')->nullable();

            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('air_vehicle_specs');
    }
};
