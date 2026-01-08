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
        Schema::create('warehouse_booking_cancellations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_booking_id')->constrained('warehouse_bookings')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('cancelled_by')->default('customer'); // customer, admin, system
            $table->text('cancellation_reason')->nullable();
            $table->date('booking_start_date'); // Original booking start date
            $table->date('cancellation_date'); // Date when cancelled
            $table->integer('days_before_booking'); // Days between cancellation and booking start
            $table->integer('allowed_cancellation_days'); // Admin setting at time of cancellation
            $table->decimal('refund_percentage', 5, 2)->default(0); // 0.00 to 100.00
            $table->decimal('original_amount', 10, 2)->default(0);
            $table->decimal('refund_amount', 10, 2)->default(0);
            $table->string('refund_status')->default('pending'); // pending, processed, completed
            $table->timestamp('refund_processed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_booking_cancellations');
    }
};
