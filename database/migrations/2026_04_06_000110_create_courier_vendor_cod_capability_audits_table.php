<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('courier_vendor_cod_capability_audits')) {
            return;
        }

        Schema::create('courier_vendor_cod_capability_audits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('courier_vendor_cod_capability_id');
            $table->unsignedBigInteger('vendor_user_id');
            $table->unsignedBigInteger('service_workspace_id')->nullable();
            $table->string('category', 30)->default('domestic');
            $table->string('event_type', 120);
            $table->string('from_status', 30)->nullable();
            $table->string('to_status', 30)->nullable();
            $table->unsignedBigInteger('actor_user_id')->nullable();
            $table->text('note')->nullable();
            $table->json('metadata')->nullable();
            $table->string('previous_hash', 64)->nullable();
            $table->string('record_hash', 64);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['courier_vendor_cod_capability_id', 'created_at'], 'cvca_capability_created_idx');
            $table->index(['vendor_user_id', 'created_at'], 'cvca_vendor_created_idx');
            $table->index(['category', 'event_type', 'created_at'], 'cvca_category_event_created_idx');

            $table->foreign('courier_vendor_cod_capability_id', 'cvca_capability_fk')
                ->references('id')
                ->on('courier_vendor_cod_capabilities')
                ->cascadeOnDelete();

            $table->foreign('vendor_user_id', 'cvca_vendor_fk')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->foreign('actor_user_id', 'cvca_actor_fk')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->foreign('service_workspace_id', 'cvca_workspace_fk')
                ->references('id')
                ->on('team_user_service_workspaces')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_vendor_cod_capability_audits');
    }
};
