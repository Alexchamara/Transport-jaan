<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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

            $table->index(['vendor_user_id', 'status'], 'cvl_vendor_status_idx');
            $table->index(['shipment_id', 'package_id'], 'cvl_shipment_package_idx');
            $table->index(['vendor_user_id', 'category'], 'cvl_vendor_category_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courier_vendor_labels');
    }
};
