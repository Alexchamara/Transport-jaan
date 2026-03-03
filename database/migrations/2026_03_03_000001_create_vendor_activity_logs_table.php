<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action'); // e.g., profile_submitted, service_approved, service_rejected, revision_requested, profile_approved, vendor_verified, vendor_blocked
            $table->string('target_type')->nullable(); // vendor_profile, vendor_service_registration, user
            $table->unsignedBigInteger('target_id')->nullable();
            $table->text('description');
            $table->json('metadata')->nullable(); // Extra context (old_status, new_status, service_name, etc.)
            $table->timestamps();

            $table->index(['vendor_id', 'created_at']);
            $table->index(['action']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_activity_logs');
    }
};
