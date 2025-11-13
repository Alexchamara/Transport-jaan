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
        Schema::create('warehouse_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_unit_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('rating')->unsigned();
            $table->text('comment')->nullable();
            $table->string('customer_name')->nullable();
            $table->text('pros')->nullable();
            $table->text('cons')->nullable();
            $table->string('stay_duration')->nullable();
            $table->boolean('verified')->default(false);
            $table->integer('helpful_votes')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['warehouse_unit_id', 'is_active']);
            $table->index(['user_id']);
            $table->unique(['warehouse_unit_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_reviews');
    }
};
