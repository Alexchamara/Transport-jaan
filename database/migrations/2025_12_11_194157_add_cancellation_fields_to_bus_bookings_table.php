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
        Schema::table('bus_bookings', function (Blueprint $table) {
            $table->timestamp('cancelled_at')->nullable()->after('expires_at');
            $table->text('cancellation_reason')->nullable()->after('cancelled_at');
            $table->decimal('refund_amount', 10, 2)->nullable()->after('cancellation_reason');
            $table->decimal('cancellation_fee', 10, 2)->nullable()->after('refund_amount');
            $table->index('cancelled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bus_bookings', function (Blueprint $table) {
            $table->dropIndex(['cancelled_at']);
            $table->dropColumn(['cancelled_at', 'cancellation_reason', 'refund_amount', 'cancellation_fee']);
        });
    }
};
