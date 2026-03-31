<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_access_review_certifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vendor_user_id');
            $table->unsignedBigInteger('service_workspace_id')->nullable();
            $table->unsignedBigInteger('subject_user_id');
            $table->unsignedBigInteger('reviewer_user_id')->nullable();
            $table->string('cycle_type', 20)->default('monthly');
            $table->string('cycle_key', 40);
            $table->string('status', 24)->default('pending');
            $table->timestamp('due_at')->nullable();
            $table->timestamp('certified_at')->nullable();
            $table->timestamp('last_access_at')->nullable();
            $table->timestamp('alerted_dormant_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('snapshot')->nullable();
            $table->timestamps();

            $table->unique(['vendor_user_id', 'service_workspace_id', 'subject_user_id', 'cycle_key'], 'courier_arc_vendor_workspace_subject_cycle_uniq');
            $table->index(['vendor_user_id', 'status'], 'courier_arc_vendor_status_idx');
            $table->index(['service_workspace_id', 'status'], 'courier_arc_workspace_status_idx');
            $table->index(['vendor_user_id', 'cycle_key'], 'courier_arc_vendor_cycle_idx');

            $table->foreign('vendor_user_id', 'courier_arc_vendor_fk')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('subject_user_id', 'courier_arc_subject_fk')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('reviewer_user_id', 'courier_arc_reviewer_fk')->references('id')->on('users')->nullOnDelete();
            $table->foreign('service_workspace_id', 'courier_arc_workspace_fk')->references('id')->on('team_user_service_workspaces')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_access_review_certifications');
    }
};
