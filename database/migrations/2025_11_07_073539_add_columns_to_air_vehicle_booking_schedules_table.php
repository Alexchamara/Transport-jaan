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
        $table = 'air_vehicle_booking_schedules';

        $existingFKs = collect(Schema::getForeignKeys($table))->pluck('name');
        $existingIndexes = collect(Schema::getIndexes($table))->pluck('name');

        Schema::table($table, function (Blueprint $t) use ($existingFKs, $existingIndexes, $table) {
            if ($existingFKs->contains('air_vehicle_booking_schedules_air_vehicle_booking_id_foreign')) {
                $t->dropForeign(['air_vehicle_booking_id']);
            }

            if ($existingIndexes->contains('avb_sched_pickup_idx')) {
                $t->dropIndex('avb_sched_pickup_idx');
            }

            if ($existingIndexes->contains('avb_sched_dropoff_idx')) {
                $t->dropIndex('avb_sched_dropoff_idx');
            }

            if (Schema::hasColumn($table, 'air_vehicle_booking_id')) {
                $t->dropColumn('air_vehicle_booking_id');
            }

            $colsToDrop = array_filter(
                ['pickup_location', 'dropoff_location', 'pickup_at', 'dropoff_at'],
                fn($col) => Schema::hasColumn($table, $col)
            );

            if (!empty($colsToDrop)) {
                $t->dropColumn(array_values($colsToDrop));
            }
        });
    }
};
