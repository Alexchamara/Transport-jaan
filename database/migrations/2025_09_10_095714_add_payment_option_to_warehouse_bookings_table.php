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
            if (!Schema::hasColumn('warehouse_bookings', 'payment_method')) {
                $table->string('payment_method')->nullable();
            }
            
            if (!Schema::hasColumn('warehouse_bookings', 'payment_option')) {
                $table->string('payment_option')->nullable();
            }
            
            if (!Schema::hasColumn('warehouse_bookings', 'payment_reference')) {
                $table->string('payment_reference')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('warehouse_bookings', function (Blueprint $table) {
            if (Schema::hasColumn('warehouse_bookings', 'payment_method')) {
                $table->dropColumn('payment_method');
            }
            
            if (Schema::hasColumn('warehouse_bookings', 'payment_option')) {
                $table->dropColumn('payment_option');
            }
            
            if (Schema::hasColumn('warehouse_bookings', 'payment_reference')) {
                $table->dropColumn('payment_reference');
            }
        });
    }
};
