<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!config('permission.teams')) {
            return;
        }

        $teamKey = config('permission.column_names.team_foreign_key', 'service_workspace_id');
        $tableNames = config('permission.table_names');

        Schema::table($tableNames['roles'], function (Blueprint $table) use ($teamKey) {
            $table->foreign($teamKey, 'team_user_roles_service_workspace_fk')
                ->references('id')
                ->on('team_user_service_workspaces')
                ->nullOnDelete();
        });

        Schema::table($tableNames['model_has_roles'], function (Blueprint $table) use ($teamKey) {
            $table->foreign($teamKey, 'team_user_model_has_roles_service_workspace_fk')
                ->references('id')
                ->on('team_user_service_workspaces')
                ->cascadeOnDelete();
        });

        Schema::table($tableNames['model_has_permissions'], function (Blueprint $table) use ($teamKey) {
            $table->foreign($teamKey, 'team_user_model_has_permissions_service_workspace_fk')
                ->references('id')
                ->on('team_user_service_workspaces')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        if (!config('permission.teams')) {
            return;
        }

        $tableNames = config('permission.table_names');

        Schema::table($tableNames['model_has_permissions'], function (Blueprint $table) {
            try {
                $table->dropForeign('team_user_model_has_permissions_service_workspace_fk');
            } catch (\Throwable) {
                $table->dropForeign('model_has_permissions_service_workspace_fk');
            }
        });

        Schema::table($tableNames['model_has_roles'], function (Blueprint $table) {
            try {
                $table->dropForeign('team_user_model_has_roles_service_workspace_fk');
            } catch (\Throwable) {
                $table->dropForeign('model_has_roles_service_workspace_fk');
            }
        });

        Schema::table($tableNames['roles'], function (Blueprint $table) {
            try {
                $table->dropForeign('team_user_roles_service_workspace_fk');
            } catch (\Throwable) {
                $table->dropForeign('roles_service_workspace_fk');
            }
        });
    }
};
