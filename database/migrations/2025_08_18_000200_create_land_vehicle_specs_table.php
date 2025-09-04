<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('land_vehicle_specs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete()->unique();

            $table->enum('body_type', ['sedan','hatchback','suv','van','bus','pickup','jeep','other', 'coupe','truck','convertible','limousine','crossover','wagon','familyMBP','sportcoupe','compact'])->nullable();
            $table->enum('fuel_type', ['petrol','diesel','hybrid','electric','cng','lpg','other'])->nullable();
            $table->enum('transmission_type', ['manual','automatic','amt','cvt','dct'])->nullable();
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
