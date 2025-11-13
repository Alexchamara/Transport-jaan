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
        Schema::create('warehouse_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_unit_id')->constrained('warehouse_units')->onDelete('cascade');
            $table->string('file_path');
            $table->string('original_name');
            $table->string('alt_text')->nullable();
            $table->string('caption')->nullable();
            $table->enum('type', ['main', 'gallery', 'floor_plan', 'exterior', 'interior'])->default('gallery');
            $table->integer('sort_order')->default(0);
            $table->string('mime_type');
            $table->bigInteger('file_size'); // in bytes
            $table->json('dimensions')->nullable(); // {width: 1920, height: 1080}
            $table->string('disk')->default('public');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes for better performance
            $table->index(['warehouse_unit_id', 'type', 'is_active']);
            $table->index(['warehouse_unit_id', 'sort_order']);
            $table->index(['type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_images');
    }
};