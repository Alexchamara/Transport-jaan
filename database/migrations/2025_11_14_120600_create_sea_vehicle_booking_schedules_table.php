<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sea_vehicle_booking_schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sea_vehicle_booking_id');
            $table->timestamp('pickup_at')->nullable();
            $table->timestamp('dropoff_at')->nullable();
            $table->string('pickup_location')->nullable();
            $table->string('dropoff_location')->nullable();
            $table->timestamps();

            $table->index('sea_vehicle_booking_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sea_vehicle_booking_schedules');
    }
};
