<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_sensitive_action_approvals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vendor_user_id');
            $table->unsignedBigInteger('service_workspace_id')->nullable();
            $table->string('action_key', 80);
            $table->string('resource_type', 80)->nullable();
            $table->unsignedBigInteger('resource_id')->nullable();
            $table->string('request_signature', 64)->index();
            $table->unsignedBigInteger('requested_by_user_id');
            $table->unsignedTinyInteger('required_approvals')->default(1);
            $table->unsignedTinyInteger('approved_count')->default(0);
            $table->json('approver_user_ids')->nullable();
            $table->decimal('amount', 12, 2)->nullable();
            $table->string('threshold_level', 50)->nullable();
            $table->string('status', 20)->default('pending');
            $table->text('reason')->nullable();
            $table->json('context')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->unsignedBigInteger('approved_by_user_id')->nullable();
            $table->unsignedBigInteger('rejected_by_user_id')->nullable();
            $table->timestamps();

            $table->index(['vendor_user_id', 'status'], 'courier_saa_vendor_status_idx');
            $table->index(['vendor_user_id', 'action_key'], 'courier_saa_vendor_action_idx');
            $table->index(['vendor_user_id', 'request_signature', 'status'], 'courier_sensitive_approvals_signature_status_idx');

            $table->foreign('vendor_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('requested_by_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('approved_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('rejected_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('service_workspace_id')->references('id')->on('team_user_service_workspaces')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_sensitive_action_approvals');
    }
};
