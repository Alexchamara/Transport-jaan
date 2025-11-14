<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('air_vehicle_booking_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('air_vehicle_bookings')->cascadeOnDelete();
            $table->string('name', 255);
            $table->decimal('price', 12, 2)->default(0);
            $table->unsignedInteger('qty')->default(1);
            $table->decimal('line_total', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('air_vehicle_booking_addons');
    }
};
