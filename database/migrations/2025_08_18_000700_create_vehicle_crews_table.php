<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_crews', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Land / Air / Sea roles
            $table->enum('role', ['driver','pilot','captain','crew'])->index();

            // Licensing / competency
            $table->string('license_number')->nullable();
            $table->string('license_type')->nullable(); // e.g., B, C, ATPL, Yacht Master, etc.
            $table->date('license_expiry')->nullable();
            $table->unsignedTinyInteger('rating')->nullable(); // 1..5 optional

            $table->boolean('is_primary')->default(false);

            $table->timestamps();

            // Make sure the same user can't be added twice with the same role on the same vehicle
            $table->unique(['vehicle_id','user_id','role']);

            $table->index(['vehicle_id','role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_crews');
    }
};
