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
        Schema::create('warehouse_amenities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_unit_id')->constrained('warehouse_units')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_included')->default(true); // Some amenities might have additional cost
            $table->decimal('additional_cost', 8, 2)->nullable(); // Cost if not included
            $table->string('cost_frequency')->nullable(); // daily, monthly, one-time
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            // Indexes for better performance
            $table->index(['warehouse_unit_id', 'is_available']);
            $table->index(['name', 'is_available']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_amenities');
    }
};