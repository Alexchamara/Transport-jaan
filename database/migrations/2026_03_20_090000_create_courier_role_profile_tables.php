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
        Schema::create('team_user_courier_role_profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('service_workspace_id');
            $table->string('role_name', 120);
            $table->string('role_label', 140);
            $table->string('source_type', 30)->default('custom');
            $table->string('source_template', 120)->nullable();
            $table->string('cloned_from_role', 120)->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('latest_version')->default(1);
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by_user_id')->nullable();
            $table->unsignedBigInteger('updated_by_user_id')->nullable();
            $table->timestamps();

            $table->unique(['service_workspace_id', 'role_name'], 'courier_role_profiles_workspace_role_unique');
            $table->index(['service_workspace_id', 'source_type'], 'courier_role_profiles_workspace_source_index');

            $table->foreign('service_workspace_id', 'courier_role_profiles_workspace_fk')
                ->references('id')
                ->on('team_user_service_workspaces')
                ->cascadeOnDelete();
            $table->foreign('created_by_user_id', 'courier_role_profiles_created_by_fk')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
            $table->foreign('updated_by_user_id', 'courier_role_profiles_updated_by_fk')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });

        Schema::create('team_user_courier_role_profile_versions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('courier_role_profile_id');
            $table->unsignedInteger('version');
            $table->string('change_type', 40);
            $table->string('role_label', 140);
            $table->text('description')->nullable();
            $table->json('permissions');
            $table->json('metadata')->nullable();
            $table->unsignedBigInteger('changed_by_user_id')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['courier_role_profile_id', 'version'], 'courier_role_profile_versions_unique');

            $table->foreign('courier_role_profile_id', 'courier_role_profile_versions_profile_fk')
                ->references('id')
                ->on('team_user_courier_role_profiles')
                ->cascadeOnDelete();
            $table->foreign('changed_by_user_id', 'courier_role_profile_versions_changed_by_fk')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_user_courier_role_profile_versions');
        Schema::dropIfExists('team_user_courier_role_profiles');
    }
};
