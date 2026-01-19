<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Cancellation tracking
            $table->timestamp('cancelled_at')->nullable()->after('status');
            $table->text('cancellation_reason')->nullable()->after('cancelled_at');
            
            // Refund tracking
            $table->decimal('refund_amount', 12, 2)->nullable()->after('cancellation_reason');
            $table->decimal('cancellation_fee', 12, 2)->nullable()->after('refund_amount');
            
            // Who cancelled: 'client' or 'vendor'
            $table->enum('cancelled_by', ['client', 'vendor'])->nullable()->after('cancellation_fee');
            
            // Commission refund for vendor (0 = vendor gets no commission, amount = refund to vendor)
            $table->decimal('vendor_commission_refund', 12, 2)->default(0)->after('cancelled_by');
            
            // Index for faster queries
            $table->index('cancelled_at');
            $table->index('cancelled_by');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['cancelled_at']);
            $table->dropIndex(['cancelled_by']);
            $table->dropColumn([
                'cancelled_at',
                'cancellation_reason',
                'refund_amount',
                'cancellation_fee',
                'cancelled_by',
                'vendor_commission_refund',
            ]);
        });
    }
};
