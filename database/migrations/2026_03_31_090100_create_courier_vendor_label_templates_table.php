<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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

            $table->unique(['vendor_user_id', 'name'], 'cvlt_vendor_name_unique');
            $table->index(['vendor_user_id', 'is_active'], 'cvlt_vendor_active_idx');
            $table->index(['vendor_user_id', 'template_type'], 'cvlt_vendor_type_idx');
            $table->index(['vendor_user_id', 'category_scope'], 'cvlt_vendor_scope_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_vendor_label_templates');
    }
};
