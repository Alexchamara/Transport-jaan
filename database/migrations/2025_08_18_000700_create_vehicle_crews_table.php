<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_crews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->enum('role', ['driver','pilot','captain','crew'])->index();
            $table->string('license_number')->nullable();
            $table->string('license_type')->nullable();
            $table->date('license_expiry')->nullable();
            $table->unsignedTinyInteger('rating')->nullable();

            $table->timestamps();

            $table->unique(['vehicle_id','user_id','role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_crews');
    }
};
