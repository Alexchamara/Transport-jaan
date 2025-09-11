<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();

            // keep varchar <=191 for safe indexing with utf8mb4
            $table->string('full_name', 191);
            $table->string('phone', 50);
            $table->string('email', 191)->nullable();
            $table->string('license_no', 100);
            $table->date('license_expiry')->nullable();
            $table->string('vehicle_type', 100);
            $table->string('vehicle_no', 100);
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->text('address')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // individual indexes (NO composite index)
            $table->index('full_name');
            $table->index('phone');
            $table->index('email');
            $table->index('license_no');
            $table->index('vehicle_no');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
