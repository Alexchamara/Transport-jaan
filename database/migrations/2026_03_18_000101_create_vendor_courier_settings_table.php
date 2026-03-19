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
        Schema::create('courier_vendor_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vendor_user_id')->unique();
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->foreign('vendor_user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courier_vendor_settings');
    }
};
