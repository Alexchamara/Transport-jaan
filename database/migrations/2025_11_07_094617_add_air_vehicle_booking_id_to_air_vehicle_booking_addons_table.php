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
        Schema::table('air_vehicle_booking_addons', function (Blueprint $table) {
              $table->foreignId('air_vehicle_booking_id')
              ->after('id')
              ->constrained('air_vehicle_bookings')
              ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('air_vehicle_booking_addons', function (Blueprint $table) {
             $table->dropForeign(['air_vehicle_booking_id']);
        $table->dropColumn('air_vehicle_booking_id');
        });
    }
};
