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
        Schema::create('freight_quotes', function (Blueprint $table) {
            $table->id();
            $table->string('origin');
            $table->string('destination');
            $table->string('load_type');
            $table->text('goods_description');
            $table->decimal('length_cm', 10, 2)->nullable();
            $table->decimal('width_cm', 10, 2)->nullable();
            $table->decimal('height_cm', 10, 2)->nullable();
            $table->decimal('total_weight_kg', 10, 2)->nullable();
            $table->enum('preferred_method', ['Air','Sea','Road']);
            $table->date('shipping_date')->nullable(); 
            $table->text('notes')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('freight_quotes');
    }
};
