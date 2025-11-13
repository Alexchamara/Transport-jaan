<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('booking_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();

            // Stored in UTC; convert at edges (app timezone = Asia/Colombo)
            $table->dateTime('pickup_at');
            $table->string('pickup_location')->nullable();

            $table->dateTime('dropoff_at');
            $table->string('dropoff_location')->nullable();

            $table->timestamps();

            $table->index(['booking_id','pickup_at']);
            $table->index(['booking_id','dropoff_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_schedules');
    }
};
