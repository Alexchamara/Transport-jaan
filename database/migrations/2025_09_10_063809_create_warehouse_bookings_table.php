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
        Schema::create('warehouse_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_unit_id')->constrained()->onDelete('cascade');
            $table->string('booking_reference')->unique();
            $table->string('status')->default('pending'); // pending, confirmed, cancelled, completed
            
            // Company Information
            $table->string('company_name')->nullable();
            $table->string('contact_person');
            $table->string('phone');
            $table->string('email');
            $table->text('company_address')->nullable();
            
            // Storage Requirements
            $table->string('storage_type'); // Cold Storage, Dry Storage, Bonded Warehouse
            $table->decimal('required_space', 10, 2); // in square meters
            $table->string('goods_type');
            $table->text('goods_description')->nullable();
            $table->decimal('estimated_weight', 10, 2)->nullable(); // in kg
            $table->json('special_requirements')->nullable(); // temperature, humidity, etc.
            $table->json('amenities')->nullable(); // selected amenities
            
            // Duration & Scheduling
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('duration_months');
            $table->string('access_hours')->nullable(); // 24/7, Business Hours, Custom
            $table->text('special_instructions')->nullable();
            
            // Pricing
            $table->decimal('monthly_rate', 10, 2);
            $table->decimal('security_deposit', 10, 2)->nullable();
            $table->decimal('setup_fee', 10, 2)->nullable();
            $table->decimal('total_amount', 12, 2);
            $table->decimal('tax_amount', 10, 2)->nullable();
            $table->decimal('final_amount', 12, 2);
            
            // Payment Information
            $table->string('payment_method')->nullable(); // bank_transfer, card, etc.
            $table->string('payment_status')->default('pending'); // pending, paid, failed
            $table->timestamp('payment_date')->nullable();
            $table->string('transaction_reference')->nullable();
            
            // Additional Fields
            $table->boolean('terms_accepted')->default(false);
            $table->boolean('insurance_required')->default(false);
            $table->text('notes')->nullable();
            $table->json('documents')->nullable(); // uploaded documents
            
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'status']);
            $table->index(['warehouse_unit_id', 'status']);
            $table->index('booking_reference');
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_bookings');
    }
};
