<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_service_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('service_category_id')->constrained('service_categories')->onDelete('cascade');
            $table->foreignId('service_sub_category_id')->constrained('service_sub_categories')->onDelete('cascade');
            $table->json('field_values')->nullable(); // Vendor's submitted data matching required_fields
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft');
            $table->text('admin_notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'service_sub_category_id'], 'vendor_service_sub_cat_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_service_registrations');
    }
};
