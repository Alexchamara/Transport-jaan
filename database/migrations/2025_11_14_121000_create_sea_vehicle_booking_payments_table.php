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
        Schema::create('sea_vehicle_booking_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sea_vehicle_booking_id')->index();
            $table->string('method');
            $table->string('option');
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->string('status')->default('pending');
            $table->string('slip_number')->nullable();
            $table->string('slip_path')->nullable();
            $table->string('tx_reference')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sea_vehicle_booking_payments');
    }
};
