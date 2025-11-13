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
        Schema::create('bus_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bus_id')->constrained('buses')->onDelete('cascade');
            $table->foreignId('departure_station_id')->constrained('bus_stations')->onDelete('cascade');
            $table->foreignId('arrival_station_id')->constrained('bus_stations')->onDelete('cascade');
            $table->time('departure_time');
            $table->time('arrival_time');
            $table->integer('duration_minutes');
            $table->date('date');
            $table->decimal('price', 8, 2);
            $table->integer('available_seats');
            $table->boolean('is_expressway')->default(false);
            $table->enum('status', ['active', 'cancelled', 'completed'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bus_schedules');
    }
};
