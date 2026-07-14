<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('air_vehicle_booking_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('air_vehicle_booking_id')->constrained('air_vehicle_bookings')->cascadeOnDelete();

            $table->enum('method', ['Credit Card','PayPal','Bank Transfer'])->index();
            $table->enum('option', ['full','advance'])->default('full');

            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->enum('status', ['pending','paid','failed'])->default('pending')->index();

            $table->string('slip_number')->nullable();
            $table->string('slip_path')->nullable();
            $table->string('tx_reference')->nullable();

            $table->timestamps();

            $table->index(['air_vehicle_booking_id','status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('air_vehicle_booking_payments');
    }
};
