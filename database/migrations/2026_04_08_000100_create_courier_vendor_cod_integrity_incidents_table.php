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
        Schema::create('courier_vendor_cod_integrity_incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courier_vendor_cod_capability_id')
                ->constrained('courier_vendor_cod_capabilities', 'id', 'cvc_integrity_incident_capability_fk')
                ->cascadeOnDelete();
            $table->foreignId('vendor_user_id')
                ->constrained('users', 'id', 'cvc_integrity_incident_vendor_fk')
                ->cascadeOnDelete();

            $table->string('category', 32)->default('domestic');
            $table->string('status', 24)->default('open');
            $table->string('severity', 16)->default('high');
            $table->string('title', 180);
            $table->text('description')->nullable();
            $table->unsignedInteger('detected_issue_count')->default(0);
            $table->json('integrity_snapshot')->nullable();
            $table->timestamp('detected_at')->nullable();

            $table->foreignId('created_by_user_id')
                ->nullable()
                ->constrained('users', 'id', 'cvc_integrity_incident_created_by_fk')
                ->nullOnDelete();
            $table->foreignId('assigned_to_user_id')
                ->nullable()
                ->constrained('users', 'id', 'cvc_integrity_incident_assigned_fk')
                ->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->foreignId('resolved_by_user_id')
                ->nullable()
                ->constrained('users', 'id', 'cvc_integrity_incident_resolved_by_fk')
                ->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_note')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index(
                ['courier_vendor_cod_capability_id', 'status'],
                'cvc_integrity_incident_cap_status_idx'
            );
            $table->index(
                ['status', 'severity', 'detected_at'],
                'cvc_integrity_incident_queue_idx'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courier_vendor_cod_integrity_incidents');
    }
};
