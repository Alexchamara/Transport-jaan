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
        Schema::create('warehouse_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('address');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('total_area', 12, 2)->nullable();
            $table->decimal('capacity', 12, 2)->nullable();
            $table->string('capacity_unit')->default('sq_ft'); // sq_ft, sq_m, cubic_ft, cubic_m
            $table->enum('type', ['cold_storage', 'dry', 'bonded', 'open_yard', 'climate_controlled', 'hazmat'])->default('dry');
            
            // Pricing Information
            $table->enum('pricing_model', ['hourly', 'daily', 'monthly', 'yearly'])->default('monthly');
            $table->decimal('base_price', 12, 2);
            $table->decimal('monthly_rate', 12, 2)->nullable();
            $table->decimal('security_deposit', 12, 2)->nullable();
            $table->decimal('setup_fee', 12, 2)->nullable();
            $table->decimal('tax_rate', 5, 4)->nullable(); // Tax percentage
            $table->decimal('total_amount', 12, 2)->nullable();
            $table->decimal('tax_amount', 12, 2)->nullable();
            $table->decimal('final_amount', 12, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            
            // Contact and Terms
            $table->string('contact_person')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->longText('terms_conditions')->nullable();
            $table->string('terms_pdf_path')->nullable();
            
            // Status and Availability
            $table->boolean('is_active')->default(true);
            $table->boolean('is_available')->default(true);
            $table->date('available_from')->nullable();
            $table->date('available_until')->nullable();
            
            // Additional Features
            $table->json('operating_hours')->nullable(); // Store operating hours
            $table->text('special_requirements')->nullable();
            $table->text('restrictions')->nullable();
            
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['user_id', 'is_active']);
            $table->index(['type', 'is_active', 'is_available']);
            $table->index(['pricing_model', 'is_active']);
            $table->index(['latitude', 'longitude']); // For location-based searches
            $table->index(['total_area', 'capacity']); // For size-based searches
            $table->index(['available_from', 'available_until']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_units');
    }
};
