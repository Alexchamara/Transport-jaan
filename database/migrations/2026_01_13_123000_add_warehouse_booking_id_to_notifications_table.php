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
        Schema::table('notifications', function (Blueprint $table) {
            if (!Schema::hasColumn('notifications', 'warehouse_booking_id')) {
                $table->foreignId('warehouse_booking_id')
                    ->nullable()
                    ->after('booking_id')
                    ->constrained('warehouse_bookings')
                    ->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            if (Schema::hasColumn('notifications', 'warehouse_booking_id')) {
                $table->dropForeign(['warehouse_booking_id']);
                $table->dropColumn('warehouse_booking_id');
            }
        });
    }
};
