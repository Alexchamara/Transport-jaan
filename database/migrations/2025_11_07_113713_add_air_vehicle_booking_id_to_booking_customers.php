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
        Schema::table('booking_customers', function (Blueprint $table) {
             $table->foreignId('air_vehicle_booking_id')
                ->nullable()
                ->constrained('air_vehicle_bookings')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_customers', function (Blueprint $table) {
            $table->dropForeign(['air_vehicle_booking_id']);
            $table->dropColumn('air_vehicle_booking_id');
        });
    }
};
