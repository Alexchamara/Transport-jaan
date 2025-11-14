<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check information_schema to see if a FK exists on vehicle_id
        $dbName = DB::getDatabaseName();
        $rows = DB::select(
            'SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL',
            [$dbName, 'air_vehicle_booking_addons', 'vehicle_id']
        );

        if (!empty($rows)) {
            $fkName = $rows[0]->CONSTRAINT_NAME;
            Schema::table('air_vehicle_booking_addons', function (Blueprint $table) use ($fkName) {
                // Drop by explicit constraint name
                $table->dropForeign($fkName);

                // Re-create with correct reference to the vehicles table
                $table->foreign('vehicle_id')
                      ->references('id')
                      ->on('vehicles')
                      ->cascadeOnDelete();
            });
        } else {
            // No existing FK found; just add the correct FK
            Schema::table('air_vehicle_booking_addons', function (Blueprint $table) {
                $table->foreign('vehicle_id')
                      ->references('id')
                      ->on('vehicles')
                      ->cascadeOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // In down(), only drop FK if it exists and then recreate the previous link
        $dbName = DB::getDatabaseName();
        $rows = DB::select(
            'SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL',
            [$dbName, 'air_vehicle_booking_addons', 'vehicle_id']
        );

        if (!empty($rows)) {
            $fkName = $rows[0]->CONSTRAINT_NAME;
            Schema::table('air_vehicle_booking_addons', function (Blueprint $table) use ($fkName) {
                $table->dropForeign($fkName);
                $table->foreign('vehicle_id')
                      ->references('id')
                      ->on('air_vehicle_bookings')
                      ->cascadeOnDelete();
            });
        } else {
            Schema::table('air_vehicle_booking_addons', function (Blueprint $table) {
                $table->foreign('vehicle_id')
                      ->references('id')
                      ->on('air_vehicle_bookings')
                      ->cascadeOnDelete();
            });
        }
    }
};
