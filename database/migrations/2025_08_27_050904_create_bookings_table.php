<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();

            $table->enum('status', ['pending','confirmed','cancelled','completed'])->default('pending')->index();

            // Snapshots (immutable after creation)
            $table->decimal('price_per_day', 12, 2)->default(0);
            $table->unsignedInteger('rental_days')->default(1);
            $table->decimal('addons_total', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('deposit_amount', 12, 2)->default(0);
            $table->decimal('advance_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('currency', 3)->default('USD');

            $table->json('addons_snapshot')->nullable();
            $table->json('vehicle_snapshot')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['vehicle_id','status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
