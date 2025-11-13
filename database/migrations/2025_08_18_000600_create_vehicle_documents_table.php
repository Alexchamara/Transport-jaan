<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicle_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->enum('doc_type', ['insurance','registration','inspection','airworthiness','coast_guard','permit','other'])->index();
            $table->string('provider_name')->nullable();
            $table->string('policy_or_doc_number')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('file_path');
            $table->timestamps();

            $table->index(['vehicle_id','doc_type','expiry_date']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('vehicle_documents');
    }
};
