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
        Schema::table('warehouse_bookings', function (Blueprint $table) {
            // Track the timestamp when a reservation is confirmed
            if (!Schema::hasColumn('warehouse_bookings', 'confirmed_at')) {
                $table->timestamp('confirmed_at')->nullable()->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('warehouse_bookings', function (Blueprint $table) {
            if (Schema::hasColumn('warehouse_bookings', 'confirmed_at')) {
                $table->dropColumn('confirmed_at');
            }
        });
    }
};
