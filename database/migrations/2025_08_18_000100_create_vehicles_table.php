<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();

            // Ownership / Provider
            $table->foreignId('provider_id')->nullable()->constrained('users')->nullOnDelete();

            // Core identity
            $table->enum('type', ['land', 'air', 'sea'])->index();
            $table->foreignId('category_id')->nullable()->constrained('vehicle_categories')->nullOnDelete();

            $table->string('model')->nullable();
            $table->string('manufacturer')->nullable(); // maps your `manufacture` field more precisely
            $table->unsignedSmallInteger('manufacture_year')->nullable();
            $table->unsignedSmallInteger('registration_year')->nullable();
            $table->string('registration_number')->nullable()->unique();

            $table->string('colour', 64)->nullable();
            $table->enum('condition', ['new','used','refurbished'])->nullable()->index();
            $table->enum('ownership_type', ['company_owned','partner_owned','leased'])->nullable()->index();

            // Capacity & specs (generic)
            $table->unsignedSmallInteger('passenger_capacity')->nullable();
            $table->unsignedInteger('mileage_km')->nullable();

            // Pricing
            $table->decimal('rental_price_per_day', 12, 2)->nullable();
            $table->decimal('total_rental_price', 12, 2)->nullable();
            $table->decimal('deposit_amount', 12, 2)->nullable();
            $table->decimal('advance_payment_amount', 12, 2)->nullable();
            $table->string('currency', 3)->default('USD');

            // Insurance (quick access)
            $table->string('insurance_provider')->nullable();
            $table->string('insurance_policy_number')->nullable();

            // Feature flags
            $table->boolean('gps')->default(false);
            $table->boolean('child_seat')->default(false);
            $table->boolean('wifi')->default(false);
            $table->boolean('insurance_coverage')->default(false);

            // Free-form extras
            $table->text('extra')->nullable();

            // Contact Information
            $table->string('contact_name')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone', 32)->nullable()->index();

            // Location Information
            $table->string('address')->nullable();
            $table->string('city')->nullable()->index();
            $table->string('state')->nullable();
            $table->string('postal_code', 32)->nullable();
            $table->string('country', 2)->nullable()->index(); // ISO-3166-1 alpha-2
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            // Operational
            $table->enum('status', ['draft','active','inactive'])->default('draft')->index();
            $table->enum('approval_status', ['pending','approved','rejected'])->default('pending')->index();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();

            $table->text('description')->nullable();

            // Legacy/ingest helpers
            $table->json('images_json')->nullable();
            $table->json('insurance_docs_json')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['type', 'status']);
            $table->index(['provider_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
