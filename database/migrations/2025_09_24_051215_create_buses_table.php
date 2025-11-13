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
        Schema::create('buses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('bus_number')->unique();
            $table->string('bus_type'); // e.g., Luxury (A/C), Semi Luxury, Normal
            $table->string('route_number');
            $table->json('facilities')->nullable(); // A/C, WiFi, USB, etc.
            $table->integer('capacity');
            $table->string('operator');
            $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('buses');
    }
};
