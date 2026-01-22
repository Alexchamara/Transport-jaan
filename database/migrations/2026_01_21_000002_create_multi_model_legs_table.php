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
        Schema::create('multi_model_legs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('multi_model_journey_id')->constrained()->onDelete('cascade');
            $table->integer('leg_order')->default(1);
            $table->string('from_location');
            $table->string('to_location');
            $table->dateTime('start_datetime');
            $table->dateTime('end_datetime');
            $table->string('vehicle_type'); // land, sea, air
            $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();
            $table->json('vehicle_snapshot')->nullable();
            $table->string('status')->default('pending'); // pending, confirmed, in_progress, completed, cancelled
            $table->timestamps();

            $table->index(['multi_model_journey_id', 'leg_order']);
            $table->index('vehicle_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('multi_model_legs');
    }
};
