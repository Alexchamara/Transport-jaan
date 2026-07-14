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
        Schema::create('warehouse_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_unit_id')->constrained('warehouse_units')->onDelete('cascade');
            $table->enum('status', ['pending', 'under_review', 'approved', 'rejected', 'maintenance', 'suspended']);
            $table->text('notes')->nullable(); // Admin notes
            $table->text('rejection_reason')->nullable();
            $table->json('checklist')->nullable(); // Approval checklist items
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('expires_at')->nullable(); // Approval expiry for renewals
            $table->json('metadata')->nullable(); // Additional approval data
            $table->timestamps();

            // Indexes for better performance
            $table->index(['warehouse_unit_id', 'status']);
            $table->index(['status', 'reviewed_at']);
            $table->index(['approved_by', 'approved_at']);
            $table->index(['expires_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_approvals');
    }
};