<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');

            // Business Information
            $table->string('company_name');
            $table->string('business_registration_no')->nullable();
            $table->string('tax_id')->nullable();
            $table->enum('business_type', ['individual', 'company', 'partnership'])->default('individual');
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->string('website')->nullable();
            $table->year('established_year')->nullable();
            $table->string('employee_count')->nullable(); // 1-10, 11-50, 51-200, 200+

            // Address
            $table->string('address_line1');
            $table->string('address_line2')->nullable();
            $table->string('city');
            $table->string('state')->nullable();
            $table->string('postal_code');
            $table->string('country');

            // Contact
            $table->string('contact_person');
            $table->string('contact_phone');
            $table->string('contact_email');

            // Submission tracking
            $table->enum('submission_status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft');
            $table->text('admin_notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_profiles');
    }
};
