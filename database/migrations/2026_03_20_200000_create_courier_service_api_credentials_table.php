<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_service_api_credentials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('service_workspace_id');
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('revoked_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('rotated_from_id')->nullable();
            $table->string('credential_name', 160);
            $table->string('service_account_code', 80);
            $table->string('role_name', 120);
            $table->json('permission_scopes')->nullable();
            $table->json('webhook_scopes')->nullable();
            $table->string('key_prefix', 20);
            $table->string('key_hash', 64)->unique();
            $table->string('status', 32)->default('active');
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->json('policy_snapshot')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['vendor_user_id', 'service_workspace_id', 'status'], 'csac_vendor_ws_status_idx');
            $table->index(['service_account_code'], 'csac_service_account_idx');
            $table->index(['expires_at'], 'csac_expires_idx');

            $table->foreign('service_workspace_id', 'csac_workspace_fk')
                ->references('id')
                ->on('team_user_service_workspaces')
                ->cascadeOnDelete();

            $table->foreign('rotated_from_id', 'csac_rotated_from_fk')
                ->references('id')
                ->on('courier_service_api_credentials')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_service_api_credentials');
    }
};
