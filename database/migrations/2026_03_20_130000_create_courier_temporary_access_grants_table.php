<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_temporary_access_grants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vendor_user_id');
            $table->unsignedBigInteger('service_workspace_id')->nullable();
            $table->unsignedBigInteger('target_user_id');
            $table->unsignedBigInteger('requested_by_user_id');
            $table->unsignedBigInteger('approved_by_user_id')->nullable();
            $table->unsignedBigInteger('rejected_by_user_id')->nullable();
            $table->unsignedBigInteger('revoked_by_user_id')->nullable();
            $table->string('grant_type', 40)->default('jit_elevation');
            $table->string('elevated_role_name', 120)->default('courier_admin');
            $table->string('ticket_ref', 120);
            $table->text('reason');
            $table->string('status', 20)->default('pending');
            $table->unsignedSmallInteger('duration_minutes')->default(120);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->json('grant_context')->nullable();
            $table->timestamps();

            $table->index(['vendor_user_id', 'status'], 'courier_tag_vendor_status_idx');
            $table->index(['vendor_user_id', 'target_user_id', 'status'], 'courier_tag_vendor_target_status_idx');
            $table->index(['service_workspace_id', 'status', 'expires_at'], 'courier_tag_workspace_status_exp_idx');

            $table->foreign('vendor_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('target_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('requested_by_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('approved_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('rejected_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('revoked_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('service_workspace_id')->references('id')->on('team_user_service_workspaces')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_temporary_access_grants');
    }
};
