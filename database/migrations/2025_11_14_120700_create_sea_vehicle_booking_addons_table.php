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
        Schema::create('sea_vehicle_booking_addons', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sea_vehicle_booking_id');
            $table->unsignedBigInteger('vehicle_id')->nullable();
            $table->string('name');
            $table->decimal('price', 10, 2)->default(0);
            $table->integer('qty')->default(1);
            $table->decimal('line_total', 12, 2)->default(0);
            $table->timestamps();

            $table->index('sea_vehicle_booking_id');
            $table->index('vehicle_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sea_vehicle_booking_addons');
    }
};
