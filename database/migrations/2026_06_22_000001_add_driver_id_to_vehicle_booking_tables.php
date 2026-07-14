<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Link a booking to an assigned driver (vendor's roster — app/Models/Driver).
     * Nullable; cleared if the driver is deleted.
     */
    private array $tables = ['bookings', 'air_vehicle_bookings', 'sea_vehicle_bookings'];

    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->foreignId('driver_id')
                    ->nullable()
                    ->after('vehicle_id')
                    ->constrained('drivers')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropForeign(['driver_id']);
                $table->dropColumn('driver_id');
            });
        }
    }
};
