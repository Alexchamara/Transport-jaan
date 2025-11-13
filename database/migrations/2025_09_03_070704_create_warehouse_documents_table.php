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
        Schema::create('warehouse_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_unit_id')->constrained('warehouse_units')->onDelete('cascade');
            $table->string('file_path');
            $table->string('original_name');
            $table->string('document_title');
            $table->text('description')->nullable();
            $table->enum('type', [
                'terms_conditions', 
                'insurance', 
                'license', 
                'safety_certificate', 
                'floor_plan', 
                'specification',
                'contract_template',
                'other'
            ]);
            $table->string('mime_type');
            $table->bigInteger('file_size'); // in bytes
            $table->string('disk')->default('public');
            $table->date('expiry_date')->nullable(); // For documents that expire
            $table->boolean('is_public')->default(false); // Whether customers can download
            $table->boolean('is_required')->default(false); // Required for booking
            $table->integer('version')->default(1); // Document versioning
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes for better performance
            $table->index(['warehouse_unit_id', 'type', 'is_active']);
            $table->index(['warehouse_unit_id', 'is_public', 'is_active']);
            $table->index(['type', 'is_active']);
            $table->index(['expiry_date', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_documents');
    }
};