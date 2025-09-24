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
        Schema::create('trains', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('train_number')->unique();
            $table->enum('class_type', ['1st Class', '2nd Class', '3rd Class', 'Luxury (A/C)', 'Semi Luxury (NL)']);
            $table->string('route_number');
            $table->json('facilities')->nullable(); // ["AC", "W", "TV", "USB", "CCTV", "WIFI"]
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
        Schema::dropIfExists('trains');
    }
};
