<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commission_earnings', function (Blueprint $table) {
            $table->id();
            
            // Reference to booking
            $table->string('booking_type')->index(); // 'land', 'air', 'sea', 'warehouse'
            $table->unsignedBigInteger('booking_id')->index();
            
            // Reference to payment
            $table->unsignedBigInteger('payment_id')->nullable()->index();
            $table->string('payment_table')->nullable(); // 'booking_payments', 'air_vehicle_booking_payments', etc.
            
            // Service and commission details
            $table->string('service_type')->index(); // 'vehicle', 'warehouse', 'courier', etc.
            $table->decimal('booking_amount', 12, 2);
            
            // Commission calculation
            $table->decimal('commission_percentage', 5, 2);
            $table->decimal('total_commission', 12, 2); // Total commission amount (before split)
            
            // Commission split between admin and vendor
            $table->decimal('admin_amount', 12, 2);
            $table->decimal('vendor_amount', 12, 2);
            $table->decimal('admin_percentage', 5, 2)->default(50); // Admin's share percentage
            $table->decimal('vendor_percentage', 5, 2)->default(50); // Vendor's share percentage
            
            // Vendor reference
            $table->unsignedBigInteger('vendor_id')->nullable()->index();
            
            // Status tracking
            $table->enum('status', ['pending', 'paid', 'failed'])->default('pending')->index();
            
            // Dates
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            
            // Indexes for analytics
            $table->index(['booking_type', 'status']);
            $table->index(['service_type', 'status']);
            $table->index(['vendor_id', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commission_earnings');
    }
};
