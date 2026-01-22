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
        Schema::create('multi_model_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('multi_model_leg_id')->constrained()->onDelete('cascade');
            $table->foreignId('multi_model_journey_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('confirmed'); // confirmed, in_progress, completed, cancelled
            $table->integer('rental_days')->default(1);
            $table->decimal('price_per_day', 10, 2)->default(0);
            $table->decimal('addons_total', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('deposit_amount', 10, 2)->default(0);
            $table->decimal('advance_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->json('addons_snapshot')->nullable();
            $table->json('vehicle_snapshot')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['multi_model_journey_id', 'user_id']);
            $table->index('multi_model_leg_id');
            $table->index('vehicle_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('multi_model_bookings');
    }
};
