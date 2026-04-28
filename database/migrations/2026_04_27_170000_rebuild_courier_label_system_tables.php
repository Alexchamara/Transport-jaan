<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    public function up(): void
    {
        // Hard cutover purge: drop legacy label schema entirely.
        Schema::dropIfExists('courier_vendor_labels');
        Schema::dropIfExists('courier_vendor_label_templates');
        Schema::dropIfExists('courier_vendor_label_sizes');

        // Remove legacy storage artifacts from previous label engine.
        Storage::disk('public')->deleteDirectory('courier/labels');
        Storage::disk('public')->deleteDirectory('courier/label-templates');

        Schema::create('courier_label_sizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 120);
            $table->decimal('width_mm', 8, 2);
            $table->decimal('height_mm', 8, 2);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['vendor_user_id', 'name'], 'cls_vendor_name_unique');
            $table->index(['vendor_user_id', 'is_active'], 'cls_vendor_active_idx');
        });

        Schema::create('courier_label_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('size_id')->nullable()->constrained('courier_label_sizes')->nullOnDelete();
            $table->string('name', 160);
            $table->string('category_scope', 20)->default('all');
            $table->string('layout_preset', 60)->default('pod_two_up_continuous');
            $table->string('orientation', 20)->default('portrait');
            $table->unsignedInteger('version')->default(1);
            $table->json('schema')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['vendor_user_id', 'name', 'version'], 'clt_vendor_name_version_unique');
            $table->index(['vendor_user_id', 'is_active'], 'clt_vendor_active_idx');
            $table->index(['vendor_user_id', 'category_scope'], 'clt_vendor_scope_idx');
        });

        Schema::create('courier_label_print_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('template_id')->nullable()->constrained('courier_label_templates')->nullOnDelete();
            $table->foreignId('size_id')->nullable()->constrained('courier_label_sizes')->nullOnDelete();
            $table->string('status', 30)->default('queued');
            $table->string('mode', 20)->default('sync');
            $table->string('output_format', 20)->default('pdf');
            $table->unsignedInteger('total_items')->default(0);
            $table->unsignedInteger('generated_items')->default(0);
            $table->unsignedInteger('failed_items')->default(0);
            $table->string('file_disk', 40)->default('public');
            $table->string('file_path', 255)->nullable();
            $table->string('file_name', 255)->nullable();
            $table->string('checksum', 64)->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamp('printed_at')->nullable();
            $table->foreignId('requested_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['vendor_user_id', 'status'], 'clpj_vendor_status_idx');
            $table->index(['vendor_user_id', 'created_at'], 'clpj_vendor_created_idx');
        });

        Schema::create('courier_label_print_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('print_job_id')->constrained('courier_label_print_jobs')->cascadeOnDelete();
            $table->foreignId('vendor_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('shipment_id')->constrained('courier_shipments')->cascadeOnDelete();
            $table->foreignId('package_id')->constrained('courier_packages')->cascadeOnDelete();
            $table->unsignedInteger('item_index')->default(0);
            $table->unsignedInteger('page_number')->default(0);
            $table->string('status', 30)->default('queued');
            $table->string('error_code', 80)->nullable();
            $table->text('error_message')->nullable();
            $table->json('payload_snapshot')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamp('printed_at')->nullable();
            $table->timestamps();

            $table->index(['vendor_user_id', 'shipment_id'], 'clpi_vendor_shipment_idx');
            $table->index(['print_job_id', 'status'], 'clpi_job_status_idx');
            $table->index(['shipment_id', 'package_id'], 'clpi_shipment_package_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_label_print_items');
        Schema::dropIfExists('courier_label_print_jobs');
        Schema::dropIfExists('courier_label_templates');
        Schema::dropIfExists('courier_label_sizes');

        Schema::create('courier_vendor_label_sizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 120);
            $table->decimal('width_mm', 8, 2);
            $table->decimal('height_mm', 8, 2);
            $table->string('unit', 10)->default('mm');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('courier_vendor_label_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('size_id')->nullable()->constrained('courier_vendor_label_sizes')->nullOnDelete();
            $table->string('name', 160);
            $table->string('template_type', 30);
            $table->string('category_scope', 20)->default('all');
            $table->string('orientation', 20)->nullable();
            $table->json('builder_schema')->nullable();
            $table->longText('html_template')->nullable();
            $table->longText('css_template')->nullable();
            $table->string('background_path', 255)->nullable();
            $table->json('asset_manifest')->nullable();
            $table->json('field_overrides')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('courier_vendor_labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('shipment_id')->constrained('courier_shipments')->cascadeOnDelete();
            $table->foreignId('package_id')->constrained('courier_packages')->cascadeOnDelete();
            $table->foreignId('template_id')->nullable()->constrained('courier_vendor_label_templates')->nullOnDelete();
            $table->foreignId('size_id')->nullable()->constrained('courier_vendor_label_sizes')->nullOnDelete();
            $table->string('category', 20)->default('domestic');
            $table->string('output_format', 20)->default('pdf');
            $table->string('status', 20)->default('queued');
            $table->string('file_disk', 40)->default('public');
            $table->string('file_path', 255)->nullable();
            $table->string('file_name', 255)->nullable();
            $table->string('checksum', 64)->nullable();
            $table->unsignedSmallInteger('page_count')->default(1);
            $table->timestamp('generated_at')->nullable();
            $table->timestamp('printed_at')->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }
};
