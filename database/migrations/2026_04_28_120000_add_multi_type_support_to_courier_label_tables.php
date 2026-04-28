<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courier_label_sizes', function (Blueprint $table) {
            $table->string('preset_code', 80)->nullable()->after('height_mm');
            $table->string('paper_class', 40)->nullable()->after('preset_code');
            $table->string('dpi_profile', 40)->nullable()->after('paper_class');
            $table->index(['vendor_user_id', 'preset_code'], 'cls_vendor_preset_idx');
        });

        Schema::table('courier_label_templates', function (Blueprint $table) {
            $table->string('label_type', 60)->default('pod')->after('name');
            $table->string('schema_version', 30)->default('v1')->after('label_type');
            $table->string('version_channel', 30)->default('stable')->after('schema_version');
            $table->timestamp('published_at')->nullable()->after('metadata');
            $table->timestamp('archived_at')->nullable()->after('published_at');
            $table->index(['vendor_user_id', 'label_type'], 'clt_vendor_type_idx');
            $table->index(['vendor_user_id', 'version_channel'], 'clt_vendor_channel_idx');
            $table->index(
                ['vendor_user_id', 'label_type', 'category_scope', 'size_id', 'version_channel', 'is_active'],
                'clt_active_type_scope_size_channel_idx'
            );
        });

        Schema::table('courier_label_print_jobs', function (Blueprint $table) {
            $table->string('label_type', 60)->default('pod')->after('size_id');
            $table->json('request_context')->nullable()->after('checksum');
            $table->string('compliance_state', 30)->default('not_required')->after('request_context');
            $table->unsignedSmallInteger('retry_count')->default(0)->after('compliance_state');
            $table->index(['vendor_user_id', 'label_type'], 'clpj_vendor_type_idx');
            $table->index(['vendor_user_id', 'compliance_state'], 'clpj_vendor_compliance_idx');
        });

        Schema::table('courier_label_print_items', function (Blueprint $table) {
            $table->string('validation_state', 30)->default('pending')->after('status');
            $table->json('compliance_errors')->nullable()->after('error_message');
            $table->json('render_warnings')->nullable()->after('compliance_errors');
            $table->index(['print_job_id', 'validation_state'], 'clpi_job_validation_idx');
        });

        Schema::create('courier_label_compliance_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('country_code', 2)->default('LK');
            $table->string('exporter_id', 120)->nullable();
            $table->string('default_incoterm', 20)->nullable();
            $table->json('profile')->nullable();
            $table->timestamps();

            $table->unique('vendor_user_id', 'clcp_vendor_unique');
        });

        Schema::create('courier_label_external_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('print_job_id')->nullable()->constrained('courier_label_print_jobs')->nullOnDelete();
            $table->foreignId('print_item_id')->nullable()->constrained('courier_label_print_items')->nullOnDelete();
            $table->string('label_type', 60);
            $table->string('provider', 80);
            $table->string('status', 40);
            $table->string('external_reference', 180)->nullable();
            $table->string('request_hash', 64)->nullable();
            $table->string('response_hash', 64)->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->index(['vendor_user_id', 'label_type'], 'clesl_vendor_type_idx');
            $table->index(['provider', 'status'], 'clesl_provider_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_label_external_sync_logs');
        Schema::dropIfExists('courier_label_compliance_profiles');

        Schema::table('courier_label_print_items', function (Blueprint $table) {
            $table->dropIndex('clpi_job_validation_idx');
            $table->dropColumn(['validation_state', 'compliance_errors', 'render_warnings']);
        });

        Schema::table('courier_label_print_jobs', function (Blueprint $table) {
            $table->dropIndex('clpj_vendor_type_idx');
            $table->dropIndex('clpj_vendor_compliance_idx');
            $table->dropColumn(['label_type', 'request_context', 'compliance_state', 'retry_count']);
        });

        Schema::table('courier_label_templates', function (Blueprint $table) {
            $table->dropIndex('clt_vendor_type_idx');
            $table->dropIndex('clt_vendor_channel_idx');
            $table->dropIndex('clt_active_type_scope_size_channel_idx');
            $table->dropColumn(['label_type', 'schema_version', 'version_channel', 'published_at', 'archived_at']);
        });

        Schema::table('courier_label_sizes', function (Blueprint $table) {
            $table->dropIndex('cls_vendor_preset_idx');
            $table->dropColumn(['preset_code', 'paper_class', 'dpi_profile']);
        });
    }
};
