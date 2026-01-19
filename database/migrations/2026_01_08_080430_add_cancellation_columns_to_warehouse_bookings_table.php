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
            if (!Schema::hasColumn('warehouse_bookings', 'cancelled_by')) {
                $table->string('cancelled_by')->nullable()->after('status');
            }
            if (!Schema::hasColumn('warehouse_bookings', 'cancelled_at')) {
                $table->timestamp('cancelled_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('warehouse_bookings', 'refund_percentage')) {
                $table->decimal('refund_percentage', 5, 2)->nullable()->after('status');
            }
            if (!Schema::hasColumn('warehouse_bookings', 'refund_amount')) {
                $table->decimal('refund_amount', 10, 2)->nullable()->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('warehouse_bookings', function (Blueprint $table) {
            $table->dropColumn(['cancelled_by', 'cancelled_at', 'refund_percentage', 'refund_amount']);
        });
    }
};
