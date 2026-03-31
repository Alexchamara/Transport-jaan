<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courier_team_security_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('service_workspace_id')->nullable();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event_type', 120);
            $table->string('event_family', 60);
            $table->string('target_type', 80)->nullable();
            $table->unsignedBigInteger('target_id')->nullable();
            $table->string('route_name', 180)->nullable();
            $table->string('ip_address', 64)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->unsignedSmallInteger('status_code')->nullable();
            $table->json('before_snapshot')->nullable();
            $table->json('after_snapshot')->nullable();
            $table->json('snapshot_diff')->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('is_alert')->default(false);
            $table->string('alert_code', 120)->nullable();
            $table->string('previous_hash', 64)->nullable();
            $table->string('record_hash', 64);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['vendor_user_id', 'service_workspace_id', 'created_at'], 'cta_vendor_ws_created_idx');
            $table->index(['event_type', 'created_at'], 'cta_event_created_idx');
            $table->index(['event_family', 'created_at'], 'cta_family_created_idx');
            $table->index(['is_alert', 'created_at'], 'cta_alert_created_idx');

            $table->foreign('service_workspace_id', 'cta_workspace_fk')
                ->references('id')
                ->on('team_user_service_workspaces')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_team_security_audits');
    }
};
