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
        Schema::table('air_vehicle_booking_schedules', function (Blueprint $table) {
            $table->foreignId('air_vehicle_booking_id')
                ->constrained('air_vehicle_bookings')
                ->cascadeOnDelete()
                ->after('id');

            $table->dateTime('pickup_at')->after('air_vehicle_booking_id');
            $table->string('pickup_location')->nullable()->after('pickup_at');

            $table->dateTime('dropoff_at')->after('pickup_location');
            $table->string('dropoff_location')->nullable()->after('dropoff_at');

            // ✅ Short custom index names
            $table->index(['air_vehicle_booking_id', 'pickup_at'], 'avb_sched_pickup_idx');
            $table->index(['air_vehicle_booking_id', 'dropoff_at'], 'avb_sched_dropoff_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('air_vehicle_booking_schedules', function (Blueprint $table) {

            // ✅ Drop foreign key first (it uses the indexes)
            $table->dropForeign(['air_vehicle_booking_id']);

            // ✅ Drop indexes after FK is removed
            $table->dropIndex('avb_sched_pickup_idx');
            $table->dropIndex('avb_sched_dropoff_idx');

            // ✅ Drop column
            $table->dropColumn('air_vehicle_booking_id');

            // ✅ Drop the added columns
            $table->dropColumn(['pickup_location', 'dropoff_location', 'pickup_at', 'dropoff_at']);
        });
    }
};
