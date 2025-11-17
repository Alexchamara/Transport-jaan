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
        Schema::create('sea_vehicle_booking_customers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sea_vehicle_booking_id');
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('country_code', 8)->nullable();
            $table->string('city')->nullable();
            $table->string('zip_code')->nullable();
            $table->unsignedInteger('age')->nullable();
            $table->string('address')->nullable();
            $table->text('notes')->nullable();
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
        Schema::dropIfExists('sea_vehicle_booking_customers');
    }
};
